'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Normalizes URL by adding https:// if no protocol is present
function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  // If already has a protocol, return as is
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Add https:// prefix
  return `https://${trimmed}`
}

// Custom URL validation that accepts URLs with or without protocol
const urlSchema = z.string().min(1, 'URL e obrigatoria').transform(normalizeUrl).refine(
  (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  { message: 'URL invalida' }
)

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Plataforma obrigatoria'),
  url: urlSchema,
})

export interface SocialLinkActionState {
  error?: string
  success?: string
}

export async function createSocialLink(
  prevState: SocialLinkActionState,
  formData: FormData
): Promise<SocialLinkActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Voce precisa estar logado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_social_buttons')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_social_buttons) {
    return { error: 'Funcionalidade nao disponivel no seu plano' }
  }

  const parsed = socialLinkSchema.safeParse({
    platform: formData.get('platform'),
    url: formData.get('url'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Get current max position
  const { data: existingLinks } = await supabase
    .from('social_links')
    .select('position')
    .eq('profile_id', user.id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existingLinks && existingLinks.length > 0 ? existingLinks[0].position + 1 : 0

  const { error } = await supabase.from('social_links').insert({
    profile_id: user.id,
    platform: parsed.data.platform,
    url: parsed.data.url,
    position: nextPosition,
  })

  if (error) {
    console.error('Error creating social link:', error)
    return { error: 'Erro ao criar link social' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appearance')
  return { success: 'Link social adicionado!' }
}

export async function updateSocialLink(
  prevState: SocialLinkActionState,
  formData: FormData
): Promise<SocialLinkActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Voce precisa estar logado' }
  }

  const id = formData.get('id') as string

  const parsed = socialLinkSchema.safeParse({
    platform: formData.get('platform'),
    url: formData.get('url'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('social_links')
    .update({
      platform: parsed.data.platform,
      url: parsed.data.url,
    })
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) {
    console.error('Error updating social link:', error)
    return { error: 'Erro ao atualizar link social' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appearance')
  return { success: 'Link social atualizado!' }
}

export async function deleteSocialLink(id: string): Promise<SocialLinkActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Voce precisa estar logado' }
  }

  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', id)
    .eq('profile_id', user.id)

  if (error) {
    console.error('Error deleting social link:', error)
    return { error: 'Erro ao excluir link social' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appearance')
  return { success: 'Link social excluido!' }
}

export async function reorderSocialLinks(orderedIds: string[]): Promise<SocialLinkActionState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Voce precisa estar logado' }
  }

  // Update positions
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('social_links')
      .update({ position: index })
      .eq('id', id)
      .eq('profile_id', user.id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some((r) => r.error)

  if (hasError) {
    return { error: 'Erro ao reordenar links sociais' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appearance')
  return { success: 'Ordem atualizada!' }
}

export async function getSocialLinks() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: 'Nao autenticado' }
  }

  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', user.id)
    .order('position', { ascending: true })

  if (error) {
    return { data: [], error: 'Erro ao buscar links sociais' }
  }

  return { data: data || [], error: null }
}

// Available platforms for the dropdown
export const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'discord', label: 'Discord' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'threads', label: 'Threads' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'medium', label: 'Medium' },
  { value: 'dribbble', label: 'Dribbble' },
  { value: 'behance', label: 'Behance' },
]
