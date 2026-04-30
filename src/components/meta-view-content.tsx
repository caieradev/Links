'use client'

import { useEffect } from 'react'
import { trackMetaEvent } from '@/components/meta-pixel'

export function MetaViewContent({ contentName }: { contentName: string }) {
  useEffect(() => {
    trackMetaEvent('ViewContent', { content_name: contentName })
  }, [contentName])

  return null
}
