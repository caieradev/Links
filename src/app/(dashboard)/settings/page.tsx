import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import type { Subscription } from '@/types/database'

export const metadata = {
  title: 'Configuracoes - Links',
  description: 'Configure sua conta',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [{ data: profile }, { data: domains }, { data: flags }, { data: subscription }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('custom_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('feature_flags')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  if (!profile) {
    return null
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SubscriptionCard subscription={subscription as Subscription | null} />
      <SettingsForm
        profile={profile}
        domains={domains ?? []}
        flags={flags}
        appDomain={appDomain}
      />
    </div>
  )
}
