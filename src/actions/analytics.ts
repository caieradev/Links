'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export interface AnalyticsData {
  totalPageViews: number
  totalLinkClicks: number
  pageViewsByDay: { date: string; count: number }[]
  linkClicksByDay: { date: string; count: number }[]
  topLinks: { id: string; title: string; url: string; clicks: number }[]
  deviceStats: { type: string; count: number }[]
  browserStats: { browser: string; count: number }[]
  referrerStats: { referrer: string; count: number }[]
}

export async function trackEvent(
  profileId: string,
  eventType: 'page_view' | 'link_click',
  linkId?: string
) {
  const supabase = await createClient()
  const headersList = await headers()

  const userAgent = headersList.get('user-agent') || ''
  const referrer = headersList.get('referer') || null

  // Parse user agent
  const parser = new UAParser(userAgent)
  const device = parser.getDevice()
  const browser = parser.getBrowser()
  const os = parser.getOS()

  let deviceType = 'desktop'
  if (device.type === 'mobile') deviceType = 'mobile'
  else if (device.type === 'tablet') deviceType = 'tablet'

  await supabase.from('analytics_events').insert({
    profile_id: profileId,
    link_id: linkId || null,
    event_type: eventType,
    referrer: referrer,
    user_agent: userAgent,
    device_type: deviceType,
    browser: browser.name || null,
    os: os.name || null,
  })
}

export async function trackLinkClick(linkId: string) {
  const supabase = await createClient()

  // Get the link to find its owner
  const { data: link } = await supabase
    .from('links')
    .select('user_id')
    .eq('id', linkId)
    .single()

  if (!link) return

  // Also increment the click_count on the link itself (legacy support)
  await supabase.rpc('increment_link_click', { link_id: linkId })

  // Track the analytics event
  await trackEvent(link.user_id, 'link_click', linkId)
}

export async function getAnalytics(days: number = 30): Promise<AnalyticsData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Check if user can view analytics
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_view_analytics')
    .eq('user_id', user.id)
    .single()

  if (!flags?.can_view_analytics) {
    return null
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Fetch all analytics events for the period
  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('profile_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Fetch user's links for mapping
  const { data: links } = await supabase
    .from('links')
    .select('id, title, url')
    .eq('user_id', user.id)

  if (!events) {
    return {
      totalPageViews: 0,
      totalLinkClicks: 0,
      pageViewsByDay: [],
      linkClicksByDay: [],
      topLinks: [],
      deviceStats: [],
      browserStats: [],
      referrerStats: [],
    }
  }

  // Process events
  const pageViews = events.filter(e => e.event_type === 'page_view')
  const linkClicks = events.filter(e => e.event_type === 'link_click')

  // Group by day
  const pageViewsByDay = groupByDay(pageViews, days)
  const linkClicksByDay = groupByDay(linkClicks, days)

  // Top links
  const linkClickCounts: Record<string, number> = {}
  linkClicks.forEach(e => {
    if (e.link_id) {
      linkClickCounts[e.link_id] = (linkClickCounts[e.link_id] || 0) + 1
    }
  })

  const topLinks = Object.entries(linkClickCounts)
    .map(([linkId, clicks]) => {
      const link = links?.find(l => l.id === linkId)
      return {
        id: linkId,
        title: link?.title || 'Link removido',
        url: link?.url || '',
        clicks,
      }
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  // Device stats
  const deviceCounts: Record<string, number> = {}
  events.forEach(e => {
    const type = e.device_type || 'unknown'
    deviceCounts[type] = (deviceCounts[type] || 0) + 1
  })
  const deviceStats = Object.entries(deviceCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Browser stats
  const browserCounts: Record<string, number> = {}
  events.forEach(e => {
    const browser = e.browser || 'unknown'
    browserCounts[browser] = (browserCounts[browser] || 0) + 1
  })
  const browserStats = Object.entries(browserCounts)
    .map(([browser, count]) => ({ browser, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Referrer stats
  const referrerCounts: Record<string, number> = {}
  events.forEach(e => {
    if (e.referrer) {
      try {
        const url = new URL(e.referrer)
        const host = url.hostname
        referrerCounts[host] = (referrerCounts[host] || 0) + 1
      } catch {
        // Invalid URL, skip
      }
    }
  })
  const referrerStats = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalPageViews: pageViews.length,
    totalLinkClicks: linkClicks.length,
    pageViewsByDay,
    linkClicksByDay,
    topLinks,
    deviceStats,
    browserStats,
    referrerStats,
  }
}

function groupByDay(events: { created_at: string }[], days: number): { date: string; count: number }[] {
  const result: Record<string, number> = {}

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    result[dateStr] = 0
  }

  // Count events
  events.forEach(e => {
    const dateStr = e.created_at.split('T')[0]
    if (result[dateStr] !== undefined) {
      result[dateStr]++
    }
  })

  return Object.entries(result).map(([date, count]) => ({ date, count }))
}
