import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanFromPriceId, PLAN_FEATURES } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use secret key client for webhook (no auth context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) return

  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Fetch the subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const planType = getPlanFromPriceId(priceId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const periodStart = subData.current_period_start
    ? new Date(subData.current_period_start * 1000).toISOString()
    : null
  const periodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000).toISOString()
    : null

  // Update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    plan_type: planType,
    status: subscription.status,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
  })

  // Update feature flags based on plan
  await updateFeatureFlags(userId, planType)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) return

  const priceId = subscription.items.data[0]?.price.id
  const planType = getPlanFromPriceId(priceId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const periodStart = subData.current_period_start
    ? new Date(subData.current_period_start * 1000).toISOString()
    : null
  const periodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000).toISOString()
    : null

  // Update subscription record
  await supabaseAdmin
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('user_id', userId)

  // Update feature flags if subscription is active
  if (subscription.status === 'active') {
    await updateFeatureFlags(userId, planType)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  if (!userId) return

  // Update subscription to free
  await supabaseAdmin
    .from('subscriptions')
    .update({
      plan_type: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
    })
    .eq('user_id', userId)

  // Downgrade feature flags to free
  await updateFeatureFlags(userId, 'free')
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Find user by customer ID
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (subscription) {
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('user_id', subscription.user_id)
  }
}

async function updateFeatureFlags(userId: string, planType: 'free' | 'starter' | 'pro') {
  const features = PLAN_FEATURES[planType]

  await supabaseAdmin
    .from('feature_flags')
    .upsert({
      user_id: userId,
      ...features,
    })
}
