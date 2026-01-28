'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/actions/analytics'

interface PageTrackerProps {
  profileId: string
}

export function PageTracker({ profileId }: PageTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true

    // Track page view
    trackEvent(profileId, 'page_view')
  }, [profileId])

  return null
}
