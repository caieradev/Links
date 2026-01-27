import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicPage } from '@/components/public-page/public-page'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ domain: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain } = await params
  const supabase = await createClient()

  // Find user by custom domain
  const { data: customDomain } = await supabase
    .from('custom_domains')
    .select('user_id')
    .eq('domain', domain)
    .eq('is_verified', true)
    .single()

  if (!customDomain) {
    return {
      title: 'Dominio nao encontrado - Links',
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('id', customDomain.user_id)
    .single()

  if (!profile) {
    return {
      title: 'Usuario nao encontrado - Links',
    }
  }

  return {
    title: `${profile.display_name} - Links`,
    description: profile.bio || `Veja os links de ${profile.display_name}`,
    openGraph: {
      title: `${profile.display_name} - Links`,
      description: profile.bio || `Veja os links de ${profile.display_name}`,
      type: 'profile',
    },
  }
}

export default async function CustomDomainPage({ params }: PageProps) {
  const { domain } = await params
  const supabase = await createClient()

  // Find user by custom domain
  const { data: customDomain } = await supabase
    .from('custom_domains')
    .select('user_id')
    .eq('domain', domain)
    .eq('is_verified', true)
    .single()

  if (!customDomain) {
    notFound()
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', customDomain.user_id)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch user's active links
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // Fetch page settings
  const { data: settings } = await supabase
    .from('page_settings')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Fetch feature flags
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  // Default settings if none exist
  const defaultSettings = {
    id: '',
    user_id: profile.id,
    background_type: 'solid',
    background_color: '#ffffff',
    background_gradient_start: null,
    background_gradient_end: null,
    background_gradient_direction: 'to bottom',
    background_image_url: null,
    background_blur: 0,
    text_color: '#000000',
    link_background_color: '#f3f4f6',
    link_text_color: '#000000',
    link_hover_color: '#e5e7eb',
    font_family: 'Inter',
    link_style: 'rounded',
    link_shadow: false,
    show_avatar: true,
    show_bio: true,
    avatar_size: 'medium',
    link_animation: 'none',
    created_at: '',
    updated_at: '',
  }

  return (
    <PublicPage
      profile={profile}
      links={links ?? []}
      settings={settings ?? defaultSettings}
      flags={flags}
    />
  )
}
