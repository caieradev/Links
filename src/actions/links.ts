'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createLinkSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(100, 'Titulo muito longo'),
  url: z.string().url('URL invalida'),
  description: z.string().max(200, 'Descricao muito longa').optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional(),
})

const updateLinkSchema = createLinkSchema.extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
})

export type LinkActionState = {
  error?: string
  success?: string
}

export async function createLink(
  prevState: LinkActionState,
  formData: FormData
): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const parsed = createLinkSchema.safeParse({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  // Check feature flag for max links
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('max_links')
    .eq('user_id', user.id)
    .single()

  const { count } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const maxLinks = flags?.max_links ?? 10

  if (count !== null && count >= maxLinks) {
    return { error: `Voce atingiu o limite de ${maxLinks} links` }
  }

  // Get the highest position
  const { data: lastLink } = await supabase
    .from('links')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const nextPosition = (lastLink?.position ?? -1) + 1

  const { error } = await supabase.from('links').insert({
    user_id: user.id,
    title: parsed.data.title,
    url: parsed.data.url,
    description: parsed.data.description || null,
    icon: parsed.data.icon || null,
    thumbnail_url: parsed.data.thumbnail_url || null,
    position: nextPosition,
  })

  if (error) {
    return { error: 'Erro ao criar link' }
  }

  revalidatePath('/dashboard')
  return { success: 'Link criado com sucesso' }
}

export async function updateLink(
  prevState: LinkActionState,
  formData: FormData
): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const parsed = updateLinkSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
    is_active: formData.get('is_active') === 'true',
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados invalidos' }
  }

  const { error } = await supabase
    .from('links')
    .update({
      title: parsed.data.title,
      url: parsed.data.url,
      description: parsed.data.description || null,
      icon: parsed.data.icon || null,
      thumbnail_url: parsed.data.thumbnail_url || null,
      is_active: parsed.data.is_active,
    })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar link' }
  }

  revalidatePath('/dashboard')
  return { success: 'Link atualizado com sucesso' }
}

export async function deleteLink(linkId: string): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao deletar link' }
  }

  revalidatePath('/dashboard')
  return { success: 'Link deletado com sucesso' }
}

export async function toggleLinkActive(linkId: string, isActive: boolean): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  const { error } = await supabase
    .from('links')
    .update({ is_active: isActive })
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar link' }
  }

  revalidatePath('/dashboard')
  return { success: 'Link atualizado com sucesso' }
}

export async function reorderLinks(
  orderedIds: string[]
): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado' }
  }

  // Update positions for all links
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('links')
      .update({ position: index })
      .eq('id', id)
      .eq('user_id', user.id)
  )

  const results = await Promise.all(updates)
  const hasError = results.some((result) => result.error)

  if (hasError) {
    return { error: 'Erro ao reordenar links' }
  }

  revalidatePath('/dashboard')
  return { success: 'Links reordenados com sucesso' }
}

export async function getUserLinks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Nao autenticado', data: null }
  }

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) {
    return { error: 'Erro ao buscar links', data: null }
  }

  return { error: null, data }
}

export async function uploadLinkThumbnail(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: 'Nao autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_link_thumbnails')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_link_thumbnails) {
    return { url: null, error: 'Voce nao tem permissao para usar thumbnails em links' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { url: null, error: 'Nenhum arquivo enviado' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('link-thumbnails')
    .upload(fileName, file)

  if (uploadError) {
    return { url: null, error: 'Erro ao fazer upload' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('link-thumbnails')
    .getPublicUrl(fileName)

  return { url: publicUrl, error: null }
}
