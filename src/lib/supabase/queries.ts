import { cache } from 'react'
import { createClient } from './server'

// Cached getUser - deduplica chamadas na mesma request
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cached profile query
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
})

// Cached feature flags query
export const getFeatureFlags = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
})

// Cached page settings query
export const getPageSettings = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
})

// Cached links query
export const getLinks = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
  return data
})

// Cached sections query
export const getSections = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('link_sections')
    .select('*')
    .eq('profile_id', userId)
    .order('position', { ascending: true })
  return data
})

// Cached social links query
export const getSocialLinks = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', userId)
    .order('position', { ascending: true })
  return data
})

// Cached subscribers query
export const getSubscribers = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscribers')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
  return data
})

// Cached custom domains query
export const getCustomDomains = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data
})

// Cached subscription query
export const getSubscription = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data
})

// Cached subscribers with count
export const getSubscribersWithCount = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, count } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact' })
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
  return { data, count }
})
