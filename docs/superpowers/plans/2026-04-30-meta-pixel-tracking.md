# Meta Pixel + Conversions API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Meta Pixel (browser) and Conversions API (server-side) tracking across the app's conversion funnel — PageView, ViewContent, Lead, CompleteRegistration, InitiateCheckout, Purchase.

**Architecture:** Two-layer tracking. A client `MetaPixel` component in root layout handles browser pixel (excluded from public profile routes). A server `meta-pixel.ts` lib sends high-value events via Meta's Conversions API. Events are deduplicated via shared `event_id` UUIDs.

**Tech Stack:** Next.js Script component, Meta Pixel JS SDK (client), Meta Conversions API v21.0 (server), Node.js crypto for SHA-256 hashing.

---

### Task 1: Server-side Conversions API utility

**Files:**
- Create: `src/lib/meta-pixel.ts`

- [ ] **Step 1: Create `src/lib/meta-pixel.ts`**

```ts
import { createHash } from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID!
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN!
const API_VERSION = 'v21.0'

function hashSHA256(value: string): string {
  return createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
}

interface UserData {
  email?: string
  clientIpAddress?: string
  clientUserAgent?: string
  fbc?: string
  fbp?: string
}

interface CustomData {
  content_name?: string
  currency?: string
  value?: number
  status?: boolean
}

export async function sendConversionEvent({
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData,
}: {
  eventName: string
  eventId: string
  eventSourceUrl: string
  userData: UserData
  customData?: CustomData
}) {
  const hashedUserData: Record<string, unknown> = {}

  if (userData.email) {
    hashedUserData.em = [hashSHA256(userData.email)]
  }
  if (userData.clientIpAddress) {
    hashedUserData.client_ip_address = userData.clientIpAddress
  }
  if (userData.clientUserAgent) {
    hashedUserData.client_user_agent = userData.clientUserAgent
  }
  if (userData.fbc) {
    hashedUserData.fbc = userData.fbc
  }
  if (userData.fbp) {
    hashedUserData.fbp = userData.fbp
  }

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: hashedUserData,
    ...(customData && { custom_data: customData }),
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [event],
          access_token: ACCESS_TOKEN,
        }),
      }
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('Meta CAPI error:', response.status, body)
    }
  } catch (error) {
    console.error('Meta CAPI request failed:', error)
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit src/lib/meta-pixel.ts 2>&1 || echo "Check complete"`

- [ ] **Step 3: Commit**

```bash
git add src/lib/meta-pixel.ts
git commit -m "feat: add Meta Conversions API server-side utility"
```

---

### Task 2: Client-side MetaPixel component

**Files:**
- Create: `src/components/meta-pixel.tsx`

- [ ] **Step 1: Create `src/components/meta-pixel.tsx`**

The component loads the Meta Pixel script and auto-fires PageView on app routes only.
It also exports a `trackMetaEvent` helper for other components to use.

The pixel base code is Meta's standard snippet — it uses inline script injection which is
the documented integration method. The PIXEL_ID comes from a build-time environment variable,
not user input.

```tsx
'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

const APP_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/pricing',
  '/settings',
  '/appearance',
  '/onboarding',
  '/termos',
  '/privacidade',
  '/analytics',
  '/subscribers',
  '/forgot-password',
])

function isAppRoute(pathname: string): boolean {
  if (APP_ROUTES.has(pathname)) return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname.startsWith('/dashboard')) return true
  if (pathname.startsWith('/settings')) return true
  if (pathname.startsWith('/cmadmin')) return true
  return false
}

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: (...args: unknown[]) => void
  }
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    if (eventId) {
      window.fbq('track', eventName, params ?? {}, { eventID: eventId })
    } else {
      window.fbq('track', eventName, params ?? {})
    }
  }
}

export function MetaPixel() {
  const pathname = usePathname()

  if (!PIXEL_ID) return null
  if (pathname.startsWith('/d/')) return null
  if (!isAppRoute(pathname)) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${PIXEL_ID}');
        fbq('track', 'PageView');
      `}</Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={'https://www.facebook.com/tr?id=' + PIXEL_ID + '&ev=PageView&noscript=1'}
          alt=""
        />
      </noscript>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/meta-pixel.tsx
git commit -m "feat: add MetaPixel client component with route exclusion"
```

---

### Task 3: Add MetaPixel to root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add import and render MetaPixel**

Add import at top of `src/app/layout.tsx`:
```ts
import { MetaPixel } from "@/components/meta-pixel";
```

Add `<MetaPixel />` inside `<body>`, after `<Analytics />`:
```tsx
        <Analytics />
        <MetaPixel />
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add MetaPixel to root layout"
```

---

### Task 4: ViewContent events on landing and pricing pages

**Files:**
- Create: `src/components/meta-view-content.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/pricing/page.tsx`

- [ ] **Step 1: Create a ViewContent tracker component**

```tsx
'use client'

import { useEffect } from 'react'
import { trackMetaEvent } from '@/components/meta-pixel'

export function MetaViewContent({ contentName }: { contentName: string }) {
  useEffect(() => {
    trackMetaEvent('ViewContent', { content_name: contentName })
  }, [contentName])

  return null
}
```

- [ ] **Step 2: Add to landing page**

In `src/app/page.tsx`, replace the file content with:
```tsx
import { LandingPage } from '@/components/landing/landing-page'
import { MetaViewContent } from '@/components/meta-view-content'

export default function HomePage() {
  return (
    <>
      <MetaViewContent contentName="Landing Page" />
      <LandingPage />
    </>
  )
}
```

- [ ] **Step 3: Add to pricing page**

In `src/app/pricing/page.tsx`, add import:
```tsx
import { MetaViewContent } from '@/components/meta-view-content'
```

Add `<MetaViewContent contentName="Pricing Page" />` as the first child inside the outer div:
```tsx
  return (
    <div className="min-h-screen bg-muted/30">
      <MetaViewContent contentName="Pricing Page" />
      <div className="container mx-auto px-4 py-16">
```

- [ ] **Step 4: Commit**

```bash
git add src/components/meta-view-content.tsx src/app/page.tsx src/app/pricing/page.tsx
git commit -m "feat: add ViewContent tracking to landing and pricing pages"
```

---

### Task 5: Lead event — register action (server CAPI) + form (client pixel)

**Files:**
- Modify: `src/actions/auth.ts` (register function, lines 98-144)
- Modify: `src/components/auth/register-form.tsx`

- [ ] **Step 1: Update AuthState type and add imports in `auth.ts`**

In `src/actions/auth.ts`, add imports at top:
```ts
import { sendConversionEvent } from '@/lib/meta-pixel'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'
```

Update the `AuthState` type:
```ts
export type AuthState = {
  error?: string
  success?: string
  eventId?: string
}
```

- [ ] **Step 2: Add CAPI Lead call in `register()` action**

In the `register()` function, replace the final return statement:
```ts
  return { success: 'Verifique seu e-mail para confirmar sua conta' }
```

With:
```ts
  // Fire Meta CAPI Lead event
  const eventId = randomUUID()
  const headersList = await headers()
  sendConversionEvent({
    eventName: 'Lead',
    eventId,
    eventSourceUrl: `${getAppUrl()}/register`,
    userData: {
      email: parsed.data.email,
      clientIpAddress: headersList.get('x-forwarded-for') || undefined,
      clientUserAgent: headersList.get('user-agent') || undefined,
    },
    customData: { content_name: 'Registration' },
  })

  return { success: 'Verifique seu e-mail para confirmar sua conta', eventId }
```

- [ ] **Step 3: Add client-side Lead tracking in `register-form.tsx`**

In `src/components/auth/register-form.tsx`, update the react import:
```ts
import { useActionState, useState, useEffect, useRef } from 'react'
```

Add import:
```ts
import { trackMetaEvent } from '@/components/meta-pixel'
```

Add after the existing state declarations (after line 30 `const [confirmPassword, setConfirmPassword] = useState('')`):
```tsx
  const leadTracked = useRef(false)

  useEffect(() => {
    if (state.success && state.eventId && !leadTracked.current) {
      leadTracked.current = true
      trackMetaEvent('Lead', { content_name: 'Registration' }, state.eventId)
    }
  }, [state.success, state.eventId])
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/auth.ts src/components/auth/register-form.tsx
git commit -m "feat: add Lead event tracking to registration (CAPI + pixel)"
```

---

### Task 6: CompleteRegistration event — onboarding action (server CAPI) + form (client pixel)

**Files:**
- Modify: `src/actions/auth.ts` (completeOnboarding function, lines 172-232)
- Modify: `src/components/auth/onboarding-form.tsx`

- [ ] **Step 1: Add CAPI CompleteRegistration call in `completeOnboarding()` action**

In `src/actions/auth.ts`, in the `completeOnboarding()` function, replace the final return:
```ts
  return { success: 'Perfil criado com sucesso' }
```

With:
```ts
  // Fire Meta CAPI CompleteRegistration event
  const eventId = randomUUID()
  const headersList = await headers()
  sendConversionEvent({
    eventName: 'CompleteRegistration',
    eventId,
    eventSourceUrl: `${getAppUrl()}/onboarding`,
    userData: {
      email: user.email || undefined,
      clientIpAddress: headersList.get('x-forwarded-for') || undefined,
      clientUserAgent: headersList.get('user-agent') || undefined,
    },
    customData: { content_name: 'Onboarding', status: true },
  })

  return { success: 'Perfil criado com sucesso', eventId }
```

Note: imports (`sendConversionEvent`, `headers`, `randomUUID`) were already added in Task 5.

- [ ] **Step 2: Add client-side CompleteRegistration tracking in `onboarding-form.tsx`**

In `src/components/auth/onboarding-form.tsx`, add import:
```ts
import { trackMetaEvent } from '@/components/meta-pixel'
```

In the `handleSubmit` function, after `completeOnboarding` returns successfully and before the checkout/redirect logic, add tracking. Replace:

```ts
      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // If user selected a paid plan, redirect to Stripe checkout
```

With:
```ts
      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // Fire Meta Pixel CompleteRegistration event
      if (result.eventId) {
        trackMetaEvent('CompleteRegistration', { content_name: 'Onboarding', status: true }, result.eventId)
      }

      // If user selected a paid plan, redirect to Stripe checkout
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/auth.ts src/components/auth/onboarding-form.tsx
git commit -m "feat: add CompleteRegistration event tracking to onboarding (CAPI + pixel)"
```

---

### Task 7: InitiateCheckout event — checkout API (server CAPI) + pricing/onboarding (client pixel)

**Files:**
- Modify: `src/app/api/stripe/checkout/route.ts`
- Modify: `src/components/pricing/pricing-section.tsx`
- Modify: `src/components/auth/onboarding-form.tsx`

- [ ] **Step 1: Add CAPI InitiateCheckout in checkout API route**

In `src/app/api/stripe/checkout/route.ts`, add import:
```ts
import { sendConversionEvent } from '@/lib/meta-pixel'
```

Update the request body parsing to accept `event_id`:
```ts
    const { plan, period, event_id } = await request.json() as { plan: 'starter' | 'pro'; period: BillingPeriod; event_id?: string }
```

Replace the return statement `return NextResponse.json({ url: session.url })` with:
```ts
    // Fire Meta CAPI InitiateCheckout event
    const eventId = event_id || crypto.randomUUID()
    sendConversionEvent({
      eventName: 'InitiateCheckout',
      eventId,
      eventSourceUrl: `${getAppUrl()}/pricing`,
      userData: {
        email: user.email || undefined,
      },
      customData: {
        content_name: plan,
        currency: 'BRL',
        value: plan === 'pro' ? (period === 'yearly' ? 300 : 31) : (period === 'yearly' ? 180 : 19),
      },
    })

    return NextResponse.json({ url: session.url, event_id: eventId })
```

- [ ] **Step 2: Add client-side InitiateCheckout in `pricing-section.tsx`**

In `src/components/pricing/pricing-section.tsx`, add import:
```ts
import { trackMetaEvent } from '@/components/meta-pixel'
```

In the `handleSelectPlan` function, replace the try block opening:

```ts
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period: billingPeriod }),
      })
```

With:
```ts
    try {
      const eventId = crypto.randomUUID()
      trackMetaEvent('InitiateCheckout', {
        content_name: plan,
        currency: 'BRL',
        value: plan === 'pro' ? (billingPeriod === 'yearly' ? 300 : 31) : (billingPeriod === 'yearly' ? 180 : 19),
      }, eventId)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period: billingPeriod, event_id: eventId }),
      })
```

- [ ] **Step 3: Add client-side InitiateCheckout in `onboarding-form.tsx`**

In `src/components/auth/onboarding-form.tsx`, in the `handleSubmit` function, replace the checkout fetch:

```ts
          const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, period: period || 'monthly' }),
          })
```

With:
```ts
          const checkoutEventId = crypto.randomUUID()
          trackMetaEvent('InitiateCheckout', {
            content_name: plan,
            currency: 'BRL',
          }, checkoutEventId)

          const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, period: period || 'monthly', event_id: checkoutEventId }),
          })
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts src/components/pricing/pricing-section.tsx src/components/auth/onboarding-form.tsx
git commit -m "feat: add InitiateCheckout event tracking (CAPI + pixel)"
```

---

### Task 8: Purchase event — Stripe webhook (server CAPI only)

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts` (handleCheckoutCompleted function, lines 92-146)

- [ ] **Step 1: Add CAPI Purchase call in webhook handler**

In `src/app/api/stripe/webhook/route.ts`, add imports:
```ts
import { sendConversionEvent } from '@/lib/meta-pixel'
import { getAppUrl } from '@/lib/utils'
```

In the `handleCheckoutCompleted` function, after `await updateFeatureFlags(userId, planType)` (line 145) and before the closing brace, add:

```ts
  // Fire Meta CAPI Purchase event
  let customerEmail: string | undefined
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer.deleted) {
      customerEmail = customer.email || undefined
    }
  } catch (err) {
    console.error('Failed to retrieve customer email for Meta CAPI:', err)
  }

  const amountTotal = session.amount_total
  sendConversionEvent({
    eventName: 'Purchase',
    eventId: `purchase_${session.id}`,
    eventSourceUrl: `${getAppUrl()}/settings`,
    userData: {
      email: customerEmail,
    },
    customData: {
      content_name: planType,
      currency: 'brl',
      value: amountTotal ? amountTotal / 100 : undefined,
    },
  })
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "feat: add Purchase event tracking via Meta CAPI in Stripe webhook"
```

---

### Task 9: Add environment variables and verify build

**Files:**
- Modify: `.env.local` (manual — user must add tokens)

- [ ] **Step 1: Add env vars to `.env.local`**

The user must manually add these to `.env.local`:
```
META_PIXEL_ID=1451485566240484
NEXT_PUBLIC_META_PIXEL_ID=1451485566240484
META_CONVERSIONS_API_TOKEN=<user's token from Meta Events Manager>
```

- [ ] **Step 2: Run full build to verify everything compiles**

Run: `npm run build 2>&1 | tail -30`

Expected: Build succeeds with no TypeScript errors related to meta-pixel files.

- [ ] **Step 3: Run lint**

Run: `npm run lint 2>&1`

Expected: No new lint errors.

- [ ] **Step 4: Manual testing checklist**

1. Open the app with Meta Pixel Helper extension
2. Visit `/` — verify PageView + ViewContent fires
3. Visit `/pricing` — verify PageView + ViewContent fires
4. Visit `/someusername` — verify NO pixel events fire
5. Register a new account — verify Lead event fires (check Events Manager for both browser + CAPI)
6. Complete onboarding — verify CompleteRegistration fires (both)
7. Click upgrade — verify InitiateCheckout fires (both)
8. Complete a test payment — verify Purchase fires in Events Manager (CAPI only)
9. Check deduplication — dual events should show as single entries in Events Manager
