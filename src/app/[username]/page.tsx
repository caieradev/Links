import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PublicPage } from '@/components/public-page/public-page'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    return {
      title: 'Usuário não encontrado - Links',
    }
  }

  return {
    title: `${profile.display_name || username} - Links`,
    description: profile.bio || `Veja os links de ${profile.display_name || username}`,
    openGraph: {
      title: `${profile.display_name || username} - Links`,
      description: profile.bio || `Veja os links de ${profile.display_name || username}`,
      type: 'profile',
    },
  }
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch user's active links, settings, flags, sections, and social links in parallel
  const [{ data: links }, { data: settings }, { data: flags }, { data: sections }, { data: socialLinks }] = await Promise.all([
    supabase
      .from('links')
      .select('*')
      .eq('user_id', profile.id)
      .eq('is_active', true)
      .order('position', { ascending: true }),
    supabase
      .from('page_settings')
      .select('*')
      .eq('user_id', profile.id)
      .single(),
    supabase
      .from('feature_flags')
      .select('*')
      .eq('user_id', profile.id)
      .single(),
    supabase
      .from('link_sections')
      .select('*')
      .eq('profile_id', profile.id)
      .order('position', { ascending: true }),
    supabase
      .from('social_links')
      .select('*')
      .eq('profile_id', profile.id)
      .order('position', { ascending: true }),
  ])

  // Check for active redirect
  if (settings?.redirect_url && settings?.redirect_until) {
    const redirectUntil = new Date(settings.redirect_until)
    if (redirectUntil > new Date()) {
      redirect(settings.redirect_url)
    }
  }

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
    subscriber_form_enabled: false,
    subscriber_form_title: 'Inscreva-se',
    subscriber_form_description: null,
    redirect_url: null,
    redirect_until: null,
    header_video_url: null,
    social_icons_position: 'hidden',
    created_at: '',
    updated_at: '',
  }

  // Build page URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const pageUrl = `${appUrl}/${username}`

  return (
    <PublicPage
      profile={profile}
      links={links ?? []}
      settings={settings ?? defaultSettings}
      flags={flags}
      sections={sections ?? []}
      socialLinks={socialLinks ?? []}
      pageUrl={pageUrl}
    />
  )
}
