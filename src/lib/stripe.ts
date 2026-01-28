// Server-only Stripe SDK - DO NOT import in client components
// For types and PRICING_PLANS, import from '@/lib/stripe-config' instead

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

// Re-export types and config from stripe-config for server-side convenience
export {
  PRICING_PLANS,
  PLAN_FEATURES,
  type PlanType,
  type BillingPeriod,
  type PricingPlan
} from './stripe-config'

// Price IDs from Stripe Dashboard (to be configured)
export const STRIPE_PRICES = {
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID!,
  starter_yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
}

export function getPriceId(plan: 'starter' | 'pro', period: 'monthly' | 'yearly'): string {
  return STRIPE_PRICES[`${plan}_${period}`]
}

export function getPlanFromPriceId(priceId: string): 'free' | 'starter' | 'pro' {
  if (priceId === STRIPE_PRICES.starter_monthly || priceId === STRIPE_PRICES.starter_yearly) {
    return 'starter'
  }
  if (priceId === STRIPE_PRICES.pro_monthly || priceId === STRIPE_PRICES.pro_yearly) {
    return 'pro'
  }
  return 'free'
}
