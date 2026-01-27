'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import crypto from 'crypto'

const profileSchema = z.object({
  display_name: z.string().min(1, 'Nome e obrigatorio').max(50, 'Nome muito longo'),
  bio: z.string().max(200, 'Bio muito longa').optional(),
})

const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Dominio e obrigatorio')
    .regex(
      /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i,
      'Dominio invalido'
    ),
})

export type SettingsState = {
  error?: string
  success?: string
}

export async function updateProfile(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || null,
    })
    .eq('id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar perfil' }
  }

  revalidatePath('/settings')
  return { success: 'Perfil atualizado com sucesso' }
}

export async function addCustomDomain(
  prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_custom_domain')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_custom_domain) {
    return { error: 'Voce nao tem permissao para usar dominios customizados' }
  }

  const parsed = domainSchema.safeParse({
    domain: formData.get('domain'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const domain = parsed.data.domain.toLowerCase()

  // Check if domain is already in use
  const { data: existing } = await supabase
    .from('custom_domains')
    .select('id')
    .eq('domain', domain)
    .single()

  if (existing) {
    return { error: 'Este dominio ja esta em uso' }
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(16).toString('hex')

  const { error } = await supabase.from('custom_domains').insert({
    user_id: user.id,
    domain,
    verification_token: verificationToken,
    is_verified: false,
  })

  if (error) {
    return { error: 'Erro ao adicionar dominio' }
  }

  revalidatePath('/settings')
  return { success: 'Dominio adicionado! Configure o DNS para verificar.' }
}

export async function verifyDomain(domainId: string): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { data: domain } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('id', domainId)
    .eq('user_id', user.id)
    .single()

  if (!domain) {
    return { error: 'Dominio nao encontrado' }
  }

  // In production, you would actually verify DNS here
  // For now, we'll just mark it as verified for demo purposes
  // Real implementation would check:
  // 1. CNAME record pointing to the app domain
  // 2. TXT record with verification token

  const { error } = await supabase
    .from('custom_domains')
    .update({ is_verified: true })
    .eq('id', domainId)

  if (error) {
    return { error: 'Erro ao verificar dominio' }
  }

  revalidatePath('/settings')
  return { success: 'Dominio verificado com sucesso!' }
}

export async function deleteDomain(domainId: string): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao remover dominio' }
  }

  revalidatePath('/settings')
  return { success: 'Dominio removido com sucesso' }
}

export async function deleteAccount(): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Use admin client to delete user from Supabase Auth
  // This will cascade delete all related data due to foreign key constraints
  const adminClient = createAdminClient()

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Error deleting user:', deleteError)
    return { error: 'Erro ao deletar conta. Tente novamente.' }
  }

  // Sign out from current session
  await supabase.auth.signOut()

  redirect('/login')
}
