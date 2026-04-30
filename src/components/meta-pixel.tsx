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
