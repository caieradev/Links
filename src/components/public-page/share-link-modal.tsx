'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check, X } from 'lucide-react'
import { detectSocialIcon, getSocialIconSvg } from '@/lib/social-icons'
import type { Link, PageSettings } from '@/types/database'

interface ShareLinkModalProps {
  link: Link
  settings: PageSettings
  profileName: string
  isOpen: boolean
  onClose: () => void
}

const shareOptions = [
  {
    name: 'Copy link',
    icon: 'copy',
    getUrl: (url: string) => url,
    action: 'copy',
  },
  {
    name: 'X',
    icon: 'x',
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    icon: 'whatsapp',
    getUrl: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    icon: 'telegram',
    getUrl: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
]

export function ShareLinkModal({ link, settings, profileName, isOpen, onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false)

  const socialInfo = detectSocialIcon(link.url)
  const socialIconSvg = socialInfo ? getSocialIconSvg(socialInfo.icon) : null

  const handleShare = async (option: typeof shareOptions[0]) => {
    if (option.action === 'copy') {
      try {
        await navigator.clipboard.writeText(link.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        console.error('Could not copy to clipboard')
      }
      return
    }

    const shareUrl = option.getUrl(link.url, link.title)
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Compartilhar link</DialogTitle>
        </DialogHeader>

        {/* Link Preview Card */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex flex-col items-center text-center gap-3">
            {/* Icon or Thumbnail */}
            {link.thumbnail_url || link.cover_image_url ? (
              <img
                src={link.cover_image_url || link.thumbnail_url || ''}
                alt=""
                className={link.cover_image_url ? 'w-full h-32 object-cover rounded-lg' : 'w-16 h-16 rounded-full object-cover'}
              />
            ) : socialIconSvg ? (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center bg-background"
              >
                <div
                  className="w-8 h-8"
                  dangerouslySetInnerHTML={{ __html: socialIconSvg }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                <span className="text-2xl font-bold">{link.title.charAt(0).toUpperCase()}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-lg">{link.title}</h3>

            {/* URL Preview */}
            <p className="text-sm text-muted-foreground truncate max-w-full">
              {new URL(link.url).hostname}
            </p>

            {/* Description */}
            {link.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {link.description}
              </p>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {shareOptions.map((option) => {
            const iconSvg = option.icon === 'copy' ? null : getSocialIconSvg(option.icon)
            const isCopyOption = option.action === 'copy'

            return (
              <button
                key={option.name}
                onClick={() => handleShare(option)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors min-w-[60px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {isCopyOption ? (
                    copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )
                  ) : iconSvg ? (
                    <div
                      className="w-5 h-5"
                      dangerouslySetInnerHTML={{ __html: iconSvg }}
                    />
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {isCopyOption && copied ? 'Copiado!' : option.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="border-t pt-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold">Junte-se a {profileName} no Links</h4>
            <p className="text-sm text-muted-foreground">
              Crie sua propria página de links gratuitamente
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <a href="/register">Cadastre-se gratuitamente</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Saiba mais</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
