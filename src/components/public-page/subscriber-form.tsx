'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { addSubscriber, type SubscriberActionState } from '@/actions/subscribers'
import type { PageSettings } from '@/types/database'
import { Mail, Check, Loader2 } from 'lucide-react'

interface SubscriberFormProps {
  profileId: string
  settings: PageSettings
}

export function SubscriberForm({ profileId, settings }: SubscriberFormProps) {
  const [state, formAction, isPending] = useActionState<SubscriberActionState, FormData>(
    addSubscriber,
    {}
  )

  if (state.success) {
    return (
      <div
        className="w-full p-4 rounded-lg flex items-center justify-center gap-2"
        style={{
          backgroundColor: settings.link_background_color,
          color: settings.link_text_color,
        }}
      >
        <Check className="h-5 w-5" />
        <span>{state.success}</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {settings.subscriber_form_title && (
        <h3
          className="text-lg font-semibold mb-2 text-center"
          style={{ color: settings.text_color }}
        >
          {settings.subscriber_form_title}
        </h3>
      )}
      {settings.subscriber_form_description && (
        <p
          className="text-sm mb-4 text-center opacity-80"
          style={{ color: settings.text_color }}
        >
          {settings.subscriber_form_description}
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="profile_id" value={profileId} />

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50"
              style={{ color: settings.link_text_color }}
            />
            <Input
              type="email"
              name="email"
              placeholder="Seu email"
              required
              className="pl-10"
              style={{
                backgroundColor: settings.link_background_color,
                color: settings.link_text_color,
                borderColor: `${settings.link_text_color}20`,
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            style={{
              backgroundColor: settings.text_color,
              color: settings.background_color,
            }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Inscrever'
            )}
          </Button>
        </div>

        {state.error && (
          <p className="text-sm text-red-500 text-center">{state.error}</p>
        )}
      </form>
    </div>
  )
}
