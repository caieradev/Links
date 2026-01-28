'use client'

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PageSettings } from '@/types/database'

interface SharePageButtonProps {
  url: string
  title: string
  settings: PageSettings
}

export function SharePageButton({ url, title, settings }: SharePageButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        })
        return
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
      console.error('Could not copy to clipboard')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className="gap-2 transition-all"
      style={{
        color: settings.text_color,
        backgroundColor: `${settings.text_color}10`,
      }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span className="hidden sm:inline">Copiado!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </>
      )}
    </Button>
  )
}
