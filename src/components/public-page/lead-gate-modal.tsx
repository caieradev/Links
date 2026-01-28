'use client'

import { useState } from 'react'
import { Mail, Loader2, Lock } from 'lucide-react'
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

interface LeadGateModalProps {
  link: Link
  settings: PageSettings
  profileId: string
  isOpen: boolean
  onClose: () => void
}

export function LeadGateModal({ link, settings, profileId, isOpen, onClose }: LeadGateModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const socialInfo = detectSocialIcon(link.url)
  const socialIconSvg = socialInfo ? getSocialIconSvg(socialInfo.icon) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Submit email to subscribers
      const formData = new FormData()
      formData.append('profile_id', profileId)
      formData.append('email', email)

      const response = await fetch('/api/lead-capture', {
        method: 'POST',
        body: JSON.stringify({
          profile_id: profileId,
          link_id: link.id,
          email: email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao processar')
      }

      // Success - redirect to link
      window.open(link.url, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Conteudo exclusivo
          </DialogTitle>
          <DialogDescription className="text-center">
            Insira seu email para acessar este link
          </DialogDescription>
        </DialogHeader>

        {/* Link Preview */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            {link.thumbnail_url || link.cover_image_url ? (
              <img
                src={link.thumbnail_url || link.cover_image_url || ''}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : socialIconSvg ? (
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                <div
                  className="w-6 h-6"
                  dangerouslySetInnerHTML={{ __html: socialIconSvg }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                <span className="text-lg font-bold">{link.title.charAt(0).toUpperCase()}</span>
              </div>
            )}
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
              'Acessar conteudo'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Seu email sera usado apenas para contato do criador deste conteudo
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
