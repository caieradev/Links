'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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
const urlSchema = z.string().min(1, 'URL é obrigatória').transform(normalizeUrl).refine(
  (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  { message: 'URL inválida' }
)

const createLinkSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  url: urlSchema,
  description: z.string().max(200, 'Descrição muito longa').optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional(),
  cover_image_url: z.string().optional(),
  requires_email: z.boolean().optional(),
  section_id: z.string().uuid().optional().nullable(),
})

const updateLinkSchema = createLinkSchema.extend({
  id: z.string().uuid(),
  is_active: z.boolean().optional(),
  cover_image_url: z.string().optional(),
  requires_email: z.boolean().optional(),
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
    return { error: 'Não autenticado' }
  }

  const sectionIdRaw = formData.get('section_id') as string
  const parsed = createLinkSchema.safeParse({
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
    cover_image_url: formData.get('cover_image_url') || undefined,
    requires_email: formData.get('requires_email') === 'true',
    section_id: sectionIdRaw && sectionIdRaw !== '' ? sectionIdRaw : null,
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
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

  const maxLinks = flags?.max_links ?? null // null = unlimited

  if (maxLinks !== null && count !== null && count >= maxLinks) {
    return { error: `Você atingiu o limite de ${maxLinks} links` }
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
    cover_image_url: parsed.data.cover_image_url || null,
    requires_email: parsed.data.requires_email ?? false,
    section_id: parsed.data.section_id || null,
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
    return { error: 'Não autenticado' }
  }

  const parsed = updateLinkSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    url: formData.get('url'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
    cover_image_url: formData.get('cover_image_url') || undefined,
    requires_email: formData.get('requires_email') === 'true',
    is_active: formData.get('is_active') === 'true',
  })

  if (!parsed.success) {
    const issues = parsed.error.issues
    return { error: issues[0]?.message || 'Dados inválidos' }
  }

  // Get current link data to compare thumbnail/cover URLs
  const { data: currentLink } = await supabase
    .from('links')
    .select('thumbnail_url, cover_image_url')
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)
    .single()

  // Clean up old storage files if URLs changed
  if (currentLink) {
    const filesToDelete: string[] = []

    // If thumbnail changed or was removed, delete old file
    if (currentLink.thumbnail_url && currentLink.thumbnail_url !== (parsed.data.thumbnail_url || null)) {
      const oldPath = extractStoragePath(currentLink.thumbnail_url, 'link-thumbnails')
      if (oldPath) filesToDelete.push(oldPath)
    }

    // If cover changed or was removed, delete old file
    if (currentLink.cover_image_url && currentLink.cover_image_url !== (parsed.data.cover_image_url || null)) {
      const oldPath = extractStoragePath(currentLink.cover_image_url, 'link-thumbnails')
      if (oldPath) filesToDelete.push(oldPath)
    }

    if (filesToDelete.length > 0) {
      await supabase.storage.from('link-thumbnails').remove(filesToDelete)
    }
  }

  const { error } = await supabase
    .from('links')
    .update({
      title: parsed.data.title,
      url: parsed.data.url,
      description: parsed.data.description || null,
      icon: parsed.data.icon || null,
      thumbnail_url: parsed.data.thumbnail_url || null,
      cover_image_url: parsed.data.cover_image_url || null,
      requires_email: parsed.data.requires_email ?? false,
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
    return { error: 'Não autenticado' }
  }

  // Get link data to find storage files
  const { data: linkData } = await supabase
    .from('links')
    .select('thumbnail_url, cover_image_url')
    .eq('id', linkId)
    .eq('user_id', user.id)
    .single()

  // Delete associated storage files
  if (linkData) {
    const filesToDelete: string[] = []

    if (linkData.thumbnail_url) {
      const thumbnailPath = extractStoragePath(linkData.thumbnail_url, 'link-thumbnails')
      if (thumbnailPath) filesToDelete.push(thumbnailPath)
    }

    if (linkData.cover_image_url) {
      const coverPath = extractStoragePath(linkData.cover_image_url, 'link-thumbnails')
      if (coverPath) filesToDelete.push(coverPath)
    }

    if (filesToDelete.length > 0) {
      await supabase.storage.from('link-thumbnails').remove(filesToDelete)
    }
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

// Helper to extract storage path from public URL
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const match = url.match(new RegExp(`/storage/v1/object/public/${bucket}/(.+)$`))
    return match ? match[1] : null
  } catch {
    return null
  }
}

export async function toggleLinkActive(linkId: string, isActive: boolean): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
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

export async function toggleLinkFeatured(linkId: string, isFeatured: boolean): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_featured_links')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_featured_links) {
    return { error: 'Você não tem permissão para destacar links' }
  }

  const { error } = await supabase
    .from('links')
    .update({ is_featured: isFeatured })
    .eq('id', linkId)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar link' }
  }

  revalidatePath('/dashboard')
  return { success: isFeatured ? 'Link destacado com sucesso' : 'Link removido do destaque' }
}

export async function reorderLinks(
  orderedIds: string[]
): Promise<LinkActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
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
    return { error: 'Não autenticado', data: null }
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
    return { url: null, error: 'Não autenticado' }
  }

  // Thumbnails are available for all plans - no feature flag check needed

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

export async function uploadLinkCoverImage(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_use_link_cover_images')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_use_link_cover_images) {
    return { url: null, error: 'Você não tem permissão para usar imagens de capa' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { url: null, error: 'Nenhum arquivo enviado' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/cover-${Date.now()}.${fileExt}`

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
