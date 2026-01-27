'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao coincidem',
  path: ['confirmPassword'],
})

const magicLinkSchema = z.object({
  email: z.string().email('Email invalido'),
})

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username deve ter no maximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username pode conter apenas letras, numeros, _ e -'),
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
    return { error: issues[0]?.message || 'Dados invalidos' }
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
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Supabase returns a user with identities = [] if email already exists (for security)
  // We need to check this to give proper feedback
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Este email ja esta cadastrado. Tente fazer login.' }
  }

  return { success: 'Verifique seu email para confirmar sua conta' }
}

export async function sendMagicLink(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const parsed = magicLinkSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Link magico enviado! Verifique seu email.' }
}

export async function completeOnboarding(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const parsed = usernameSchema.safeParse({
    username: formData.get('username'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const username = parsed.data.username.toLowerCase()

  // Check if username is taken
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return { error: 'Este username ja esta em uso' }
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

  redirect('/dashboard')
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
