'use client'

import { useState } from 'react'
import { Mail, Phone, Loader2, Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Link, PageSettings } from '@/types/database'
import { detectSocialIcon, getSocialIconSvg } from '@/lib/social-icons'
import { formatPhone } from '@/lib/utils'

interface LeadGateModalProps {
  link: Link
  settings: PageSettings
  profileId: string
  isOpen: boolean
  onClose: () => void
}

export function LeadGateModal({ link, settings, profileId, isOpen, onClose }: LeadGateModalProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const socialInfo = detectSocialIcon(link.url)
  const socialIconSvg = socialInfo ? getSocialIconSvg(socialInfo.icon) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: profileId,
          link_id: link.id,
          email: email,
          name: name || undefined,
          phone: phone,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao processar')
      }

      // Success - redirect to link (use location.href for mobile compatibility)
      window.location.href = link.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderLinkIcon = () => {
    if (link.thumbnail_url || link.cover_image_url) {
      return (
        <img
          src={link.thumbnail_url || link.cover_image_url || ''}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
        />
      )
    }
    if (socialIconSvg) {
      return (
        <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
          {/* Social icon SVGs are generated internally by getSocialIconSvg, not user input */}
          <div
            className="w-6 h-6"
            dangerouslySetInnerHTML={{ __html: socialIconSvg }}
          />
        </div>
      )
    }
    return (
      <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
        <span className="text-lg font-bold">{link.title.charAt(0).toUpperCase()}</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Conteúdo exclusivo
          </DialogTitle>
          <DialogDescription className="text-center">
            Insira seu email para acessar este link
          </DialogDescription>
        </DialogHeader>

        {/* Link Preview */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            {renderLinkIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{link.title}</h3>
              {link.description && (
                <p className="text-sm text-muted-foreground truncate">{link.description}</p>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor email"
              required
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(00) 00000-0000"
              required
              className="pl-10"
            />
          </div>

          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Seu nome"
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Acessar conteúdo'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Seu email sera usado apenas para contato do criador deste conteúdo
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
