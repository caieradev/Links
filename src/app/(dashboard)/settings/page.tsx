import { SettingsForm } from '@/components/dashboard/settings-form'
import { SubscriptionCard } from '@/components/dashboard/subscription-card'
import { getUser, getProfile, getFeatureFlags, getCustomDomains, getSubscription } from '@/lib/supabase/queries'
import type { Subscription } from '@/types/database'

export const metadata = {
  title: 'Configuracões - Links',
  description: 'Configure sua conta',
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  // Parallel queries
  const [profile, domains, flags, subscription] = await Promise.all([
    getProfile(user.id),
    getCustomDomains(user.id),
    getFeatureFlags(user.id),
    getSubscription(user.id),
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
