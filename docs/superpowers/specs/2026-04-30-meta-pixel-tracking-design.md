# Meta Pixel + Conversions API Tracking

**Date:** 2026-04-30
**Purpose:** Add Meta Pixel (browser) and Conversions API (server-side) tracking to drive subscriber acquisition through Meta ads. Purely commercial — build audiences, optimize ad delivery, track conversion funnel.

**Pixel/Dataset ID:** 1451485566240484

---

## Architecture

Two-layer tracking with event deduplication:

1. **Client-side Meta Pixel** — `<Script>` loaded in root layout via a `MetaPixel` client component. Uses `usePathname()` to **exclude** public profile routes (`/[username]` and `/d/[domain]`). Fires `PageView`, `ViewContent`, and client-side conversion events.

2. **Server-side Conversions API (CAPI)** — a `src/lib/meta-pixel.ts` utility that POSTs events to `https://graph.facebook.com/v21.0/1451485566240484/events`. Called from server actions and API routes for high-value conversion events.

**Deduplication:** Both layers share an `event_id` (UUID). Client generates it, passes it to server actions. Meta deduplicates by `event_id` + `event_name`.

**User matching:**
- Client-side: automatic via `fbp`/`fbc` cookies set by the pixel
- Server-side: SHA-256 hashed email via `user_data.em` parameter

---

## Event Mapping

| Event | Trigger | Client Pixel | Server CAPI | Priority | User Data |
|---|---|---|---|---|---|
| PageView | App pages load (landing, pricing, auth, dashboard) — NEVER public profiles | Yes | No | normal | fbp/fbc cookies |
| ViewContent | Landing page (`/`) and pricing page (`/pricing`) | Yes | No | normal | fbp/fbc cookies |
| Lead | `register()` action succeeds | Yes | Yes | normal | email (hashed) |
| CompleteRegistration | `completeOnboarding()` action succeeds | Yes | Yes | ! | email (hashed) |
| InitiateCheckout | `/api/stripe/checkout` creates session | Yes | Yes | !! | email (hashed) |
| Purchase | Stripe webhook `checkout.session.completed` | No | Yes (only) | !!! | email (hashed, from Stripe) |

### Event Details

**PageView**
- Fires automatically when pixel loads on any app page
- Excluded from `[username]` and `d/[domain]` routes via pathname check
- No custom parameters needed

**ViewContent**
- Fires on mount of landing page and pricing page
- Parameters: `{ content_name: 'Landing Page' | 'Pricing Page' }`

**Lead**
- Client: fires when register form receives success response
- Server: fires in `register()` action after successful `supabase.auth.signUp()` and identity check passes
- Parameters: `{ content_name: 'Registration' }`
- User data: email from form submission (hashed server-side)

**CompleteRegistration**
- Client: fires when onboarding form receives success response (before redirect)
- Server: fires in `completeOnboarding()` action after profile + settings + flags created
- Parameters: `{ content_name: 'Onboarding', status: true }`
- User data: email from authenticated user (hashed server-side)

**InitiateCheckout**
- Client: fires before redirect to Stripe checkout URL
- Server: fires in `/api/stripe/checkout` after session creation
- Parameters: `{ content_name: plan, currency: 'BRL', value: price }`
- Dedup: client generates `event_id`, sends in POST body, server uses same ID
- User data: email from authenticated user (hashed server-side)

**Purchase**
- Server-only (user is on Stripe's domain during payment)
- Fires in Stripe webhook handler inside `handleCheckoutCompleted()`
- Parameters: `{ content_name: plan_type, currency: 'brl', value: amount_total/100 }`
- User data: email from Stripe customer object (hashed)
- No deduplication needed (single source)

---

## New Files

### `src/lib/meta-pixel.ts`
Server-side Conversions API utility:
- `sendConversionEvent(eventName, eventId, userData, customData?)` — POSTs to Meta CAPI
- `hashUserData(email)` — SHA-256 hash, lowercase, trimmed
- Uses `META_CONVERSIONS_API_TOKEN` env var for authentication
- Uses `META_PIXEL_ID` env var for pixel/dataset ID
- Includes `action_source: 'website'`, timestamp, and event URL

### `src/components/meta-pixel.tsx`
Client component (`'use client'`):
- Loads Meta Pixel base script via `next/script` (afterInteractive strategy)
- Initializes `fbq('init', PIXEL_ID)` and `fbq('track', 'PageView')`
- Uses `usePathname()` to return `null` on routes matching `/[username]` or `/d/[domain]` patterns
- Route detection logic: exclude paths that are a single segment and NOT one of the known app routes (login, register, dashboard, pricing, settings, appearance, onboarding, termos, privacidade, analytics, subscribers, forgot-password)
- Also excludes paths starting with `/d/`
- Exports `trackEvent(eventName, params?, eventId?)` helper for components to call `fbq('trackCustom'|'track', ...)`

---

## Modified Files

| File | Change |
|---|---|
| `src/app/layout.tsx` | Import and render `<MetaPixel />` inside `<body>` |
| `src/components/auth/register-form.tsx` | On success state, call client-side `Lead` event with generated `event_id` |
| `src/components/auth/onboarding-form.tsx` | On success state, call client-side `CompleteRegistration` with `event_id` |
| `src/actions/auth.ts` | Add CAPI `Lead` call in `register()` on success; add CAPI `CompleteRegistration` in `completeOnboarding()` on success |
| `src/app/api/stripe/checkout/route.ts` | Add CAPI `InitiateCheckout` call after session creation; accept `event_id` from request body; return `event_id` in response |
| `src/app/api/stripe/webhook/route.ts` | Add CAPI `Purchase` call in `handleCheckoutCompleted()` with Stripe amount and customer email |
| `src/components/pricing/pricing-section.tsx` | Generate `event_id`, fire client `InitiateCheckout`, pass `event_id` in checkout POST body |
| `src/components/auth/onboarding-form.tsx` | Same as above — also calls `/api/stripe/checkout` when user selected a paid plan during onboarding |

---

## Environment Variables

New entries in `.env.local`:

```
META_PIXEL_ID=1451485566240484
NEXT_PUBLIC_META_PIXEL_ID=1451485566240484
META_CONVERSIONS_API_TOKEN=<token from Meta Events Manager>
```

---

## Route Exclusion Logic

The `MetaPixel` component must NOT load on public profile pages. Detection approach:

```
Known app routes: /, /login, /register, /dashboard, /pricing, /settings,
  /appearance, /onboarding, /termos, /privacidade, /analytics,
  /subscribers, /forgot-password, /auth/*,  /api/*, /d/*

Excluded from pixel:
  - /d/* (custom domain routes)
  - Any top-level path segment that is NOT a known app route
    (these are username routes like /johndoe)
```

This is implemented as a whitelist: if the pathname doesn't match a known app route pattern, the pixel component returns `null`.

---

## Deduplication Flow

Example for InitiateCheckout (the pattern applies to Lead and CompleteRegistration too):

1. Client generates `event_id = crypto.randomUUID()`
2. Client calls `fbq('track', 'InitiateCheckout', params, { eventID: event_id })`
3. Client sends `{ plan, period, event_id }` to `/api/stripe/checkout`
4. Server calls CAPI with same `event_id`, hashed email, and event data
5. Meta receives both, deduplicates by `event_id` + `event_name`, counts once

For Purchase: no deduplication needed — fires only from webhook (server-side).

---

## Testing

- Use Meta Pixel Helper browser extension to verify client-side events
- Use Meta Events Manager > Test Events to verify CAPI events
- Check deduplication in Events Manager — dual events should show as single entries
- Verify public profile pages (`/username`) do NOT fire any pixel events
