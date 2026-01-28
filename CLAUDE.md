# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Links is a Linktree-like application for creating customizable link-in-bio pages. Users can create profiles, manage links, customize appearance, and optionally use custom domains.

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Database/Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS 4, shadcn/ui components (Radix UI)
- **Forms**: React Hook Form with Zod validation
- **Drag & Drop**: dnd-kit

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages
  - `(auth)/` - Login, register, email confirmation
  - `(dashboard)/` - Protected dashboard, appearance, settings
  - `[username]/` - Public profile pages
  - `d/[domain]/` - Custom domain handler
- `src/actions/` - Server Actions for all mutations (auth, links, settings, appearance, analytics)
- `src/components/` - React components (ui/, auth/, dashboard/, links/, public-page/)
- `src/lib/supabase/` - Supabase clients (client.ts for browser, server.ts for RSC, admin.ts for elevated ops)
- `src/types/database.ts` - Auto-generated Supabase types
- `supabase/migrations/` - Database schema and RLS policies

### Key Patterns

**Server/Client Split**: Pages default to server components. Interactive forms use `'use client'`. All data mutations go through Server Actions in `src/actions/`.

**Supabase Clients**: Use `createClient()` from `lib/supabase/client.ts` for client components, `createClient()` from `lib/supabase/server.ts` for server components/actions.

**Validation**: Zod schemas validate both client-side (React Hook Form) and server-side (in actions). Always validate in actions before database operations.

**Custom Domain Routing**: Middleware in `src/proxy.ts` detects custom domains and rewrites to `/d/[domain]`.

**Feature Flags**: Tier-based feature gating (Free/Pro/Business) via `feature_flags` table. Defaults in `src/lib/feature-flags.ts`.

### Database Tables

- `profiles` - User data (username, display_name, bio, avatar_url)
- `links` - User links (title, url, icon, thumbnail, position, click_count)
- `page_settings` - Appearance customization (colors, gradients, fonts, animations)
- `feature_flags` - Subscription features per user
- `custom_domains` - Domain verification and mapping

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_DOMAIN`
