'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PricingPlan, BillingPeriod, PlanType } from '@/lib/stripe'

interface PricingCardProps {
  plan: PricingPlan
  period: BillingPeriod
  currentPlan?: PlanType
  onSelect?: (plan: 'starter' | 'pro', period: BillingPeriod) => Promise<void>
  highlighted?: boolean
}

export function PricingCard({ plan, period, currentPlan, onSelect, highlighted }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const price = period === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthlyPrice
  const isCurrentPlan = currentPlan === plan.type
  const isFree = plan.type === 'free'
  const isUpgrade = !isFree && !isCurrentPlan && (currentPlan === 'free' || (currentPlan === 'starter' && plan.type === 'pro'))

  const handleSelect = async () => {
    if (!onSelect || isFree || isCurrentPlan) return

    setIsLoading(true)
    try {
      await onSelect(plan.type as 'starter' | 'pro', period)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn(
      'relative flex flex-col',
      highlighted && 'border-primary shadow-lg scale-105'
    )}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {isFree ? 'Para começar' : plan.type === 'starter' ? 'Para criadores' : 'Para profissionais'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">
            {isFree ? 'Gratis' : `R$${price}`}
          </span>
          {!isFree && (
            <span className="text-muted-foreground">/mes</span>
          )}
          {!isFree && period === 'yearly' && (
            <p className="text-sm text-muted-foreground mt-1">
              Cobrado R${plan.yearlyPrice}/ano
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isFree ? (
          <Button variant="outline" className="w-full" disabled>
            {isCurrentPlan ? 'Plano atual' : 'Gratis'}
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={highlighted ? 'default' : 'outline'}
            onClick={handleSelect}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCurrentPlan ? 'Plano atual' : isUpgrade ? 'Fazer upgrade' : 'Selecionar'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
