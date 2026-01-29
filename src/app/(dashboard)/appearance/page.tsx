import { AppearanceForm } from '@/components/dashboard/appearance-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUser, getProfile, getPageSettings, getFeatureFlags } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Aparência - Links',
  description: 'Personalize a aparência da sua página',
}

export default async function AppearancePage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  // Parallel queries - todas rodam ao mesmo tempo
  const [profile, settings, flags] = await Promise.all([
    getProfile(user.id),
    getPageSettings(user.id),
    getFeatureFlags(user.id),
  ])

  if (!profile) {
    return null
  }

  const defaultSettings = {
    id: '',
    user_id: user.id,
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
    social_icons_position: 'below',
    hide_branding: false,
    created_at: '',
    updated_at: '',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Personalize o visual da sua página de links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppearanceForm
            profile={profile}
            settings={settings ?? defaultSettings}
            flags={flags}
          />
        </CardContent>
      </Card>
    </div>
  )
}
