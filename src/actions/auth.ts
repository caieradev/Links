'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getAppUrl } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

const magicLinkSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username pode conter apenas letras, números, _ e -'),
})

export type AuthState = {
  error?: string
  success?: string
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user has a profile
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Erro ao fazer login' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  redirect('/dashboard')
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  // Get plan selection from form data
  const plan = formData.get('plan') as string | null
  const period = formData.get('period') as string | null

  // Build redirect URL with plan params if present
  let redirectUrl = `${getAppUrl()}/auth/confirm`
  if (plan) {
    const params = new URLSearchParams()
    params.set('plan', plan)
    if (period) params.set('period', period)
    redirectUrl += `?${params.toString()}`
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectUrl,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Supabase returns a user with identities = [] if email already exists (for security)
  // We need to check this to give proper feedback
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Este email já está cadastrado. Tente fazer login.' }
  }

  return { success: 'Verifique seu e-mail para confirmar sua conta' }
}

export async function sendMagicLink(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const parsed = magicLinkSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getAppUrl()}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Link mágico enviado! Verifique seu e-mail.' }
}

export async function completeOnboarding(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const parsed = usernameSchema.safeParse({
    username: formData.get('username'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  const username = parsed.data.username.toLowerCase()

  // Check if username is taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return { error: 'Este username já está em uso' }
  }

  // Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    display_name: user.email?.split('@')[0] || username,
  })

  if (profileError) {
    return { error: 'Erro ao criar perfil' }
  }

  // Create default page settings
  const { error: settingsError } = await supabase.from('page_settings').insert({
    user_id: user.id,
  })

  if (settingsError) {
    console.error('Error creating page settings:', settingsError)
  }

  // Create default feature flags
  const { error: flagsError } = await supabase.from('feature_flags').insert({
    user_id: user.id,
  })

  if (flagsError) {
    console.error('Error creating feature flags:', flagsError)
  }

  return { success: 'Perfil criado com sucesso' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  const supabase = await createClient()

  const parsed = usernameSchema.safeParse({ username })
  if (!parsed.success) {
    return { available: false }
  }

  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username.toLowerCase())
    .single()

  return { available: !data }
}

export async function requestPasswordReset(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email || !z.string().email().safeParse(email).success) {
    return { error: 'E-mail inválido' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.' }
}

export async function updatePassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { error: 'Senha deve ter pelo menos 6 caracteres' }
  }

  if (password !== confirmPassword) {
    return { error: 'Senhas não coincidem' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Senha atualizada com sucesso!' }
}

export async function changePassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword) {
    return { error: 'Senha atual é obrigatória' }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Nova senha deve ter pelo menos 6 caracteres' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Senhas não coincidem' }
  }

  // Verify current password by re-authenticating
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Senha atual incorreta' }
  }

  // Update to new password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Senha alterada com sucesso!' }
}
