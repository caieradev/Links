import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanFromPriceId, PLAN_FEATURES } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

// Use admin client for webhook (bypasses RLS)
const supabaseAdmin = createAdminClient()

// Helper to find user_id from Stripe customer (via metadata or database)
async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  // First, try to get from Stripe customer metadata
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (!customer.deleted && customer.metadata?.user_id) {
      return customer.metadata.user_id
    }
  } catch (err) {
    console.error('Failed to retrieve Stripe customer:', err)
  }

  // Fallback: try to find in database by stripe_customer_id
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  return subscription?.user_id || null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Webhook: No signature provided')
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

  console.log(`Webhook received: ${event.type}`)

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
  const subscriptionId = session.subscription as string
  const customerId = session.customer as string

  // Try to get user_id from session metadata, then fallback to customer
  let userId = session.metadata?.user_id
  if (!userId) {
    console.log('Checkout: No user_id in session metadata, trying customer lookup')
    userId = await getUserIdFromCustomer(customerId)
  }

  if (!userId) {
    console.error('Checkout: Could not find user_id for customer:', customerId)
    return
  }

  console.log(`Checkout completed for user: ${userId}, plan subscription: ${subscriptionId}`)

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
  const customerId = subscription.customer as string

  // Try to get user_id from subscription metadata, then fallback to customer
  let userId = subscription.metadata?.user_id
  if (!userId) {
    console.log('Subscription update: No user_id in metadata, trying customer lookup')
    userId = await getUserIdFromCustomer(customerId)
  }

  if (!userId) {
    console.error('Subscription update: Could not find user_id for customer:', customerId)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const planType = getPlanFromPriceId(priceId)

  console.log(`Subscription updated for user: ${userId}, plan: ${planType}, status: ${subscription.status}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subData = subscription as any
  const periodStart = subData.current_period_start
    ? new Date(subData.current_period_start * 1000).toISOString()
    : null
  const periodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000).toISOString()
    : null

  // Upsert subscription record (insert if not exists, update if exists)
  await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    })

  // Update feature flags if subscription is active
  if (subscription.status === 'active') {
    await updateFeatureFlags(userId, planType)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Try to get user_id from subscription metadata, then fallback to customer
  let userId = subscription.metadata?.user_id
  if (!userId) {
    console.log('Subscription deleted: No user_id in metadata, trying customer lookup')
    userId = await getUserIdFromCustomer(customerId)
  }

  if (!userId) {
    console.error('Subscription deleted: Could not find user_id for customer:', customerId)
    return
  }

  console.log(`Subscription deleted for user: ${userId}`)

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
