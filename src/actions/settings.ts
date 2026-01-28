'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { addDomainToVercel, removeDomainFromVercel, verifyDomainOnVercel, getVercelDomainConfig } from '@/lib/vercel'
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
    return { error: 'Não autenticado' }
  }

  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name'),
    bio: formData.get('bio') || undefined,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
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
    return { error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_custom_domain')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_custom_domain) {
    return { error: 'Você não tem permissão para usar dominios customizados' }
  }

  const parsed = domainSchema.safeParse({
    domain: formData.get('domain'),
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
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

  // Add domain to Vercel first
  const vercelResult = await addDomainToVercel(domain)
  if (!vercelResult.success) {
    return { error: vercelResult.error || 'Erro ao configurar dominio no servidor' }
  }

  const { error } = await supabase.from('custom_domains').insert({
    user_id: user.id,
    domain,
    verification_token: verificationToken,
    is_verified: false,
  })

  if (error) {
    // Rollback: remove from Vercel if DB insert fails
    await removeDomainFromVercel(domain)
    return { error: 'Erro ao adicionar dominio' }
  }

  revalidatePath('/settings')
  return { success: 'Dominio adicionado! Configure o DNS para verificar.' }
}

export async function verifyDomain(domainId: string): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: domainData } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('id', domainId)
    .eq('user_id', user.id)
    .single()

  if (!domainData) {
    return { error: 'Dominio não encontrado' }
  }

  // Verify domain configuration on Vercel
  const vercelVerify = await verifyDomainOnVercel(domainData.domain)

  if (!vercelVerify.success) {
    // Check if DNS is at least configured
    const configCheck = await getVercelDomainConfig(domainData.domain)

    if (!configCheck.configured) {
      return { error: 'DNS não configurado. Adicione um CNAME apontando para cname.vercel-dns.com' }
    }

    if (!configCheck.verified) {
      return { error: 'Aguardando propagacao do DNS. Tente novamente em alguns minutos.' }
    }
  }

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
    return { error: 'Não autenticado' }
  }

  // Get domain name first to remove from Vercel
  const { data: domainData } = await supabase
    .from('custom_domains')
    .select('domain')
    .eq('id', domainId)
    .eq('user_id', user.id)
    .single()

  if (!domainData) {
    return { error: 'Dominio não encontrado' }
  }

  // Remove from database
  const { error } = await supabase
    .from('custom_domains')
    .delete()
    .eq('id', domainId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao remover dominio' }
  }

  // Remove from Vercel (don't fail if this fails, domain is already removed from DB)
  await removeDomainFromVercel(domainData.domain)

  revalidatePath('/settings')
  return { success: 'Dominio removido com sucesso' }
}

export async function deleteAccount(): Promise<SettingsState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
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
