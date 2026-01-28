'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding, checkUsernameAvailability, type AuthState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect } from 'react'
import { toast } from 'sonner'

const initialState: AuthState = {}

interface OnboardingFormProps {
  plan?: string
  period?: string
}

export function OnboardingForm({ plan, period }: OnboardingFormProps) {
  const router = useRouter()
  const [state, action, pending] = useActionState(completeOnboarding, initialState)
  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debouncedUsername = useDebounce(username, 500)

  useEffect(() => {
    if (debouncedUsername.length >= 3) {
      startTransition(async () => {
        const result = await checkUsernameAvailability(debouncedUsername)
        setIsAvailable(result.available)
      })
    } else {
      setIsAvailable(null)
    }
  }, [debouncedUsername])

  const handleSubmit = async () => {
    if (!isAvailable || username.length < 3) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('username', username)
      const result = await completeOnboarding(initialState, formData)

      if (result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // If user selected a paid plan, redirect to Stripe checkout
      if (plan && plan !== 'free') {
        try {
          const response = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan, period: period || 'monthly' }),
          })
          const data = await response.json()

          if (data.url) {
            window.location.href = data.url
            return
          }
        } catch (checkoutError) {
          console.error('Error creating checkout session:', checkoutError)
          toast.error('Erro ao processar pagamento. Redirecionando para o dashboard.')
        }
      }

      router.push('/dashboard')
    } catch (error) {
      toast.error('Erro ao processar. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Escolha seu username</CardTitle>
        <CardDescription>
          Seu username sera usado na URL da sua pagina de links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="seuusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pr-10"
                required
              />
              {username.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isAvailable ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {username.length >= 3 && !isChecking && (
              <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-destructive'}`}>
                {isAvailable
                  ? `${process.env.NEXT_PUBLIC_APP_DOMAIN}/${username.toLowerCase()} esta disponivel!`
                  : 'Este username ja esta em uso'}
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={pending || isSubmitting || !isAvailable || username.length < 3}
            onClick={handleSubmit}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
