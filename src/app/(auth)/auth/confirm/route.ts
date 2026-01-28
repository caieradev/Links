import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()
  let authError = null

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  }
  // Handle magic link / email OTP flow (token_hash parameter)
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'magiclink',
    })
    authError = error
  }

  if (!authError && (code || token_hash)) {
    // Check if user has a profile
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Redirect to onboarding if no profile exists
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // Return to login with error
  const errorMsg = authError?.message || 'auth'
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`)
}
