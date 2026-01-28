'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingToggle } from './pricing-toggle'
import { PricingCard } from './pricing-card'
import { PRICING_PLANS, type BillingPeriod, type PlanType } from '@/lib/stripe-config'
import { toast } from 'sonner'

interface PricingSectionProps {
  currentPlan?: PlanType
  isAuthenticated?: boolean
}

export function PricingSection({ currentPlan = 'free', isAuthenticated = false }: PricingSectionProps) {
  const [period, setPeriod] = useState<BillingPeriod>('yearly')
  const router = useRouter()

  const handleSelectPlan = async (plan: 'starter' | 'pro', billingPeriod: BillingPeriod) => {
    // If not authenticated, redirect to register with plan params
    if (!isAuthenticated) {
      router.push(`/register?plan=${plan}&period=${billingPeriod}`)
      return
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period: billingPeriod }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erro ao processar pagamento')
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Escolha seu plano</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Comece grátis e faça upgrade quando quiser
        </p>
        <PricingToggle period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.type}
            plan={plan}
            period={period}
            currentPlan={currentPlan}
            onSelect={handleSelectPlan}
            highlighted={plan.type === 'starter'}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  )
}
