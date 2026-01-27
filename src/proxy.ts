import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check for custom domain routing
  const hostname = request.headers.get('host') || ''
  const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'

  // Check if this is a custom domain (not main domain, localhost, or vercel.app)
  const isCustomDomain = !hostname.includes(mainDomain) &&
                         !hostname.includes('localhost') &&
                         !hostname.includes('vercel.app')

  if (isCustomDomain) {
    // Extract just the domain without port
    const customDomain = hostname.split(':')[0]

    // Custom domains only serve the root page
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = `/d/${customDomain}`
      return NextResponse.rewrite(url)
    }

    // Any other path on custom domain returns 404
    return NextResponse.rewrite(new URL('/_not-found', request.url))
  }

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/appearance', '/settings']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Auth routes - redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isAuthRoute && user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (!profile) {
      url.pathname = '/onboarding'
    } else {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }

  // Onboarding route - redirect if not authenticated or already has profile
  if (pathname === '/onboarding') {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
