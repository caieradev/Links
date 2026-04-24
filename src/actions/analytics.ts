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

  // Aggregate all analytics in Postgres via RPC — returns only summary counts
  interface AnalyticsSummary {
    events_by_day: { date: string; event_type: string; count: number }[]
    top_links: { id: string; title: string | null; url: string | null; clicks: number }[]
    device_stats: { type: string; count: number }[]
    browser_stats: { browser: string; count: number }[]
    referrer_stats: { referrer: string; count: number }[]
  }

  const { data } = await supabase.rpc('get_analytics_summary', {
    p_profile_id: user.id,
    p_start_date: startDate.toISOString(),
  })

  const summary = data as unknown as AnalyticsSummary | null

  if (!summary) {
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

  // Build day-by-day arrays from DB aggregation
  const pvCounts: Record<string, number> = {}
  const lcCounts: Record<string, number> = {}

  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    pvCounts[key] = 0
    lcCounts[key] = 0
  }

  // Fill in actual counts from DB
  for (const row of summary.events_by_day) {
    const dateStr = String(row.date)
    if (row.event_type === 'page_view' && dateStr in pvCounts) {
      pvCounts[dateStr] = Number(row.count)
    } else if (row.event_type === 'link_click' && dateStr in lcCounts) {
      lcCounts[dateStr] = Number(row.count)
    }
  }

  const pageViewsByDay = Object.entries(pvCounts).map(([date, count]) => ({ date, count }))
  const linkClicksByDay = Object.entries(lcCounts).map(([date, count]) => ({ date, count }))

  const totalPageViews = pageViewsByDay.reduce((sum, d) => sum + d.count, 0)
  const totalLinkClicks = linkClicksByDay.reduce((sum, d) => sum + d.count, 0)

  const topLinks = summary.top_links.map(l => ({
    id: l.id,
    title: l.title || 'Link removido',
    url: l.url || '',
    clicks: Number(l.clicks),
  }))

  return {
    totalPageViews,
    totalLinkClicks,
    pageViewsByDay,
    linkClicksByDay,
    topLinks,
    deviceStats: summary.device_stats,
    browserStats: summary.browser_stats,
    referrerStats: summary.referrer_stats,
  }
}
