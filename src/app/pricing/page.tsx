import { createClient } from '@/lib/supabase/server'
import { PricingSection } from '@/components/pricing/pricing-section'
import type { PlanType } from '@/lib/stripe'

export const metadata = {
  title: 'Precos - Links',
  description: 'Escolha o plano ideal para voce',
}

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: PlanType = 'free'

  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single()

    if (subscription?.plan_type) {
      currentPlan = subscription.plan_type as PlanType
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-16">
        <PricingSection currentPlan={currentPlan} />
      </div>
    </div>
  )
}
