'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Bell, Mail, Phone, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addSubscriber, type SubscriberActionState } from '@/actions/subscribers'
import type { PageSettings } from '@/types/database'
import { formatPhone } from '@/lib/utils'

interface SubscriberBellModalProps {
  profileId: string
  settings: PageSettings
}

export function SubscriberBellModal({ profileId, settings }: SubscriberBellModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [state, formAction, isPending] = useActionState<SubscriberActionState, FormData>(
    addSubscriber,
    {}
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          style={{
            color: settings.text_color,
            backgroundColor: `${settings.text_color}10`,
          }}
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Inscrever-se</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            {settings.subscriber_form_title || 'Inscreva-se'}
          </DialogTitle>
        </DialogHeader>

        {state.success ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-center text-muted-foreground">{state.success}</p>
            <Button onClick={() => setIsOpen(false)}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {settings.subscriber_form_description && (
              <p className="text-sm text-center text-muted-foreground">
                {settings.subscriber_form_description}
              </p>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="profile_id" value={profileId} />

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Seu email"
                  required
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="pl-10"
                />
              </div>

              <Input
                type="text"
                name="name"
                placeholder="Seu nome"
                required
              />

              {state.error && (
                <p className="text-sm text-red-500 text-center">{state.error}</p>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inscrevendo...
                  </>
                ) : (
                  'Inscrever-se'
                )}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
