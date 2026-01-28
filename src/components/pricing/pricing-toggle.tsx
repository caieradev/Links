'use client'

import { cn } from '@/lib/utils'
import type { BillingPeriod } from '@/lib/stripe-config'

interface PricingToggleProps {
  period: BillingPeriod
  onChange: (period: BillingPeriod) => void
}

export function PricingToggle({ period, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
          period === 'monthly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Mensal
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-lg transition-colors relative',
          period === 'yearly'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        Anual
        <span className="absolute -top-3 -right-3 bg-white text-black border border-black text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          -20%
        </span>
      </button>
    </div>
  )
}
