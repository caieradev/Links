import { createClient } from '@/lib/supabase/server'
import { AppearanceForm } from '@/components/dashboard/appearance-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Aparencia - Links',
  description: 'Personalize a aparencia da sua pagina',
}

export default async function AppearancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: settings } = await supabase
    .from('page_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', user.id)
    .single()

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
    created_at: '',
    updated_at: '',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Aparencia</CardTitle>
          <CardDescription>
            Personalize o visual da sua pagina de links
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
