'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { FeatureFlags, PageSettings } from '@/types/database'
import { getThemeById } from '@/lib/themes'

const pageSettingsSchema = z.object({
  background_type: z.enum(['solid', 'gradient', 'image']),
  background_color: z.string(),
  background_gradient_start: z.string().nullable(),
  background_gradient_end: z.string().nullable(),
  background_gradient_direction: z.string(),
  background_image_url: z.string().nullable(),
  background_blur: z.number().min(0).max(20),
  text_color: z.string(),
  link_background_color: z.string(),
  link_text_color: z.string(),
  link_hover_color: z.string(),
  font_family: z.string(),
  link_style: z.enum(['rounded', 'pill', 'square', 'outline']),
  link_shadow: z.boolean(),
  show_avatar: z.boolean(),
  show_bio: z.boolean(),
  avatar_size: z.enum(['small', 'medium', 'large']),
  link_animation: z.enum(['none', 'fade', 'slide', 'bounce']),
  subscriber_form_enabled: z.boolean(),
  subscriber_form_title: z.string(),
  subscriber_form_description: z.string().nullable(),
  header_video_url: z.string().nullable(),
  social_icons_position: z.enum(['hidden', 'above', 'below']),
})

export type AppearanceState = {
  error?: string
  success?: string
}

export async function updatePageSettings(
  prevState: AppearanceState,
  formData: FormData
): Promise<AppearanceState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Get feature flags to validate what user can change
  const { data: flagsData } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const flags = flagsData as FeatureFlags | null

  const subscriberFormEnabled = formData.get('subscriber_form_enabled') === 'true'

  const data = {
    background_type: formData.get('background_type') as string,
    background_color: formData.get('background_color') as string,
    background_gradient_start: formData.get('background_gradient_start') as string || null,
    background_gradient_end: formData.get('background_gradient_end') as string || null,
    background_gradient_direction: formData.get('background_gradient_direction') as string,
    background_image_url: formData.get('background_image_url') as string || null,
    background_blur: parseInt(formData.get('background_blur') as string) || 0,
    text_color: formData.get('text_color') as string,
    link_background_color: formData.get('link_background_color') as string,
    link_text_color: formData.get('link_text_color') as string,
    link_hover_color: formData.get('link_hover_color') as string,
    font_family: formData.get('font_family') as string,
    link_style: formData.get('link_style') as string,
    link_shadow: formData.get('link_shadow') === 'true',
    show_avatar: formData.get('show_avatar') === 'true',
    show_bio: formData.get('show_bio') === 'true',
    avatar_size: formData.get('avatar_size') as string,
    link_animation: formData.get('link_animation') as string,
    subscriber_form_enabled: subscriberFormEnabled && (flags?.can_collect_subscribers ?? false),
    subscriber_form_title: formData.get('subscriber_form_title') as string || 'Inscreva-se',
    subscriber_form_description: formData.get('subscriber_form_description') as string || null,
    header_video_url: formData.get('header_video_url') as string || null,
    social_icons_position: formData.get('social_icons_position') as string || 'hidden',
  }

  // Validate feature flags
  if (data.background_type === 'gradient' && !flags?.can_use_gradients) {
    return { error: 'Você não tem permissão para usar gradientes' }
  }

  if (data.background_type === 'image' && !flags?.can_use_custom_background_image) {
    return { error: 'Você não tem permissão para usar imagem de fundo' }
  }

  if (data.font_family !== 'Inter' && !flags?.can_use_custom_fonts) {
    return { error: 'Você não tem permissão para usar fontes customizadas' }
  }

  if (data.link_animation !== 'none' && !flags?.can_use_animations) {
    return { error: 'Você não tem permissão para usar animações' }
  }

  if (data.header_video_url && !flags?.can_use_header_video) {
    return { error: 'Você não tem permissão para usar vídeo de cabeçalho' }
  }

  if (data.social_icons_position !== 'hidden' && !flags?.can_use_social_buttons) {
    return { error: 'Você não tem permissão para usar ícones sociais' }
  }

  const parsed = pageSettingsSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Dados inválidos' }
  }

  // Update profile data (display_name and bio)
  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string | null

  if (displayName) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio || null,
      })
      .eq('id', user.id)

    if (profileError) {
      return { error: 'Erro ao atualizar perfil' }
    }
  }

  const { error } = await supabase
    .from('page_settings')
    .update(parsed.data as Partial<PageSettings>)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao salvar configurações' }
  }

  revalidatePath('/appearance')
  revalidatePath('/settings')
  return { success: 'Configurações salvas com sucesso' }
}

export async function uploadAvatar(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: 'Não autenticado' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { url: null, error: 'Nenhum arquivo enviado' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { url: null, error: 'Erro ao fazer upload' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update profile with new avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  revalidatePath('/appearance')
  return { url: publicUrl, error: null }
}

export async function uploadBackground(formData: FormData): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { url: null, error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flagsData } = await supabase
    .from('feature_flags')
    .select('can_use_custom_background_image')
    .eq('user_id', user.id)
    .single()

  const flags = flagsData as Pick<FeatureFlags, 'can_use_custom_background_image'> | null

  if (!flags?.can_use_custom_background_image) {
    return { url: null, error: 'Você não tem permissão para usar imagem de fundo' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { url: null, error: 'Nenhum arquivo enviado' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/background.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('backgrounds')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { url: null, error: 'Erro ao fazer upload' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('backgrounds')
    .getPublicUrl(fileName)

  // Update page settings with new background URL
  await supabase
    .from('page_settings')
    .update({
      background_type: 'image',
      background_image_url: publicUrl,
    } as Partial<PageSettings>)
    .eq('user_id', user.id)

  revalidatePath('/appearance')
  return { url: publicUrl, error: null }
}

export async function updateRedirectSettings(
  prevState: AppearanceState,
  formData: FormData
): Promise<AppearanceState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flagsData } = await supabase
    .from('feature_flags')
    .select('can_use_redirect_links')
    .eq('user_id', user.id)
    .single()

  const flags = flagsData as Pick<FeatureFlags, 'can_use_redirect_links'> | null

  if (!flags?.can_use_redirect_links) {
    return { error: 'Você não tem permissão para usar redirecionamento' }
  }

  let redirectUrl = formData.get('redirect_url') as string || null
  const redirectUntilStr = formData.get('redirect_until') as string || null

  // Normalize and validate URL if provided
  if (redirectUrl) {
    redirectUrl = redirectUrl.trim()
    // Add https:// if no protocol
    if (!/^https?:\/\//i.test(redirectUrl)) {
      redirectUrl = `https://${redirectUrl}`
    }
    try {
      new URL(redirectUrl)
    } catch {
      return { error: 'URL inválida' }
    }
  }

  const redirectUntil = redirectUntilStr ? new Date(redirectUntilStr).toISOString() : null

  const { error } = await supabase
    .from('page_settings')
    .update({
      redirect_url: redirectUrl,
      redirect_until: redirectUntil,
    } as Partial<PageSettings>)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao salvar redirecionamento' }
  }

  revalidatePath('/appearance')
  return { success: 'Redirecionamento salvo com sucesso' }
}

export async function applyTheme(themeId: string): Promise<AppearanceState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Check feature flag
  const { data: flagsData } = await supabase
    .from('feature_flags')
    .select('can_use_themes')
    .eq('user_id', user.id)
    .single()

  const flags = flagsData as Pick<FeatureFlags, 'can_use_themes'> | null

  if (!flags?.can_use_themes) {
    return { error: 'Você não tem permissão para usar temas' }
  }

  const theme = getThemeById(themeId)
  if (!theme) {
    return { error: 'Tema não encontrado' }
  }

  const { error } = await supabase
    .from('page_settings')
    .update(theme.settings as Partial<PageSettings>)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao aplicar tema' }
  }

  revalidatePath('/appearance')
  return { success: 'Tema aplicado com sucesso' }
}
