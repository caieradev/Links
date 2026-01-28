'use client'

import { useActionState } from 'react'
import { updateRedirectSettings, type AppearanceState } from '@/actions/appearance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasFeature } from '@/lib/feature-flags'
import { Loader2, Lock, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { FeatureFlags, PageSettings } from '@/types/database'

interface RedirectSettingsProps {
  flags: FeatureFlags | null
  settings: PageSettings
}

const initialState: AppearanceState = {}

export function RedirectSettings({ flags, settings }: RedirectSettingsProps) {
  const [state, action, pending] = useActionState(updateRedirectSettings, initialState)
  const canUseRedirectLinks = hasFeature(flags, 'can_use_redirect_links')

  // Check if redirect is currently active
  const redirectUntil = settings.redirect_until ? new Date(settings.redirect_until) : null
  const isRedirectActive = settings.redirect_url && redirectUntil && redirectUntil > new Date()

  // Format datetime-local value
  const formatDatetimeLocal = (date: Date | null) => {
    if (!date) return ''
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    return localDate.toISOString().slice(0, 16)
  }

  if (!canUseRedirectLinks) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Recurso Premium</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            O redirecionamento temporario esta disponível a partir do plano Starter.
            Redirecione visitantes para campanhas e promocoes por tempo limitado.
          </p>
          <Button asChild>
            <Link href="/settings">Fazer Upgrade</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redirecionamento Temporario</CardTitle>
        <CardDescription>
          Redirecione visitantes para outra página por tempo limitado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {isRedirectActive && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Redirecionamento ativo ate {redirectUntil?.toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="redirect_url">URL de destino</Label>
            <Input
              id="redirect_url"
              name="redirect_url"
              placeholder="meusite.com/promocao"
              defaultValue={settings.redirect_url || ''}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para desativar o redirecionamento
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirect_until">Redirecionar ate</Label>
            <Input
              id="redirect_until"
              name="redirect_until"
              type="datetime-local"
              defaultValue={formatDatetimeLocal(redirectUntil)}
            />
            <p className="text-xs text-muted-foreground">
              Apos essa data, os visitantes verao sua página normal
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
