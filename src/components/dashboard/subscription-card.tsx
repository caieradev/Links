'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Subscription } from '@/types/database'

interface SubscriptionCardProps {
  subscription: Subscription | null
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const planType = subscription?.plan_type ?? 'free'
  const planName = planType === 'pro' ? 'Pro' : planType === 'starter' ? 'Starter' : 'Free'
  const isActive = subscription?.status === 'active'
  const isPastDue = subscription?.status === 'past_due'
  const willCancel = subscription?.cancel_at_period_end
  const isFree = planType === 'free' || !subscription

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleManageSubscription = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erro ao abrir portal de pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assinatura</CardTitle>
            <CardDescription>Gerencie seu plano e pagamentos</CardDescription>
          </div>
          <Badge variant={isActive ? 'default' : isPastDue ? 'destructive' : 'secondary'}>
            {planName}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPastDue && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Pagamento pendente</p>
              <p className="text-muted-foreground">
                Atualize seu metodo de pagamento para continuar usando os recursos premium.
              </p>
            </div>
          </div>
        )}

        {willCancel && subscription?.current_period_end && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-600">Cancelamento agendado</p>
              <p className="text-muted-foreground">
                Sua assinatura sera cancelada em {formatDate(subscription.current_period_end)}.
                Você pode reativar a qualquer momento.
              </p>
            </div>
          </div>
        )}

        {!isFree && subscription?.current_period_end && !willCancel && (
          <div className="text-sm text-muted-foreground">
            Proxima cobranca: {formatDate(subscription.current_period_end)}
          </div>
        )}

        {isFree && (
          <div className="text-sm text-muted-foreground">
            Voce esta no plano gratuito. Faca upgrade para desbloquear recursos premium.
          </div>
        )}

        <div className="flex gap-3">
          {subscription?.stripe_subscription_id && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <ExternalLink className="mr-2 h-4 w-4" />
              Gerenciar assinatura
            </Button>
          )}

          {isFree && (
            <Button asChild>
              <a href="/pricing">Fazer upgrade</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
