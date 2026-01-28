'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding, checkUsernameAvailability, type AuthState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect } from 'react'
import { PRICING_PLANS, type BillingPeriod, type PlanType } from '@/lib/stripe'
import { PricingToggle } from '@/components/pricing/pricing-toggle'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const initialState: AuthState = {}

export function OnboardingForm() {
  const router = useRouter()
  const [state, action, pending] = useActionState(completeOnboarding, initialState)
  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, startTransition] = useTransition()
  const debouncedUsername = useDebounce(username, 500)

  // Step management
  const [step, setStep] = useState<'username' | 'plan'>('username')
  const [period, setPeriod] = useState<BillingPeriod>('yearly')
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleContinueToPlans = () => {
    if (isAvailable && username.length >= 3) {
      setStep('plan')
    }
  }

  const handleSelectPlan = async (planType: PlanType) => {
    setSelectedPlan(planType)
    setIsProcessing(true)

    try {
      // First, create the profile
      const formData = new FormData()
      formData.append('username', username)
      const result = await completeOnboarding(initialState, formData)

      if (result.error) {
        toast.error(result.error)
        setIsProcessing(false)
        return
      }

      // If free plan, just redirect to dashboard
      if (planType === 'free') {
        router.push('/dashboard')
        return
      }

      // For paid plans, redirect to checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType, period }),
      })

      const data = await response.json()

      if (data.error) {
        toast.error(data.error)
        // Profile was created, redirect to dashboard anyway
        router.push('/dashboard')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error('Erro ao processar. Tente novamente.')
      setIsProcessing(false)
    }
  }

  if (step === 'plan') {
    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Escolha seu plano</h1>
          <p className="text-muted-foreground">
            Selecione o plano ideal para voce. Voce pode mudar a qualquer momento.
          </p>
        </div>

        <div className="flex justify-center">
          <PricingToggle period={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRICING_PLANS.map((plan) => {
            const price = period === 'monthly' ? plan.monthlyPrice : plan.yearlyMonthlyPrice
            const isFree = plan.type === 'free'
            const isHighlighted = plan.type === 'starter'
            const isSelected = selectedPlan === plan.type

            return (
              <Card
                key={plan.type}
                className={cn(
                  'relative flex flex-col cursor-pointer transition-all',
                  isHighlighted && 'border-primary shadow-lg',
                  isSelected && 'ring-2 ring-primary',
                  isProcessing && 'opacity-50 pointer-events-none'
                )}
                onClick={() => !isProcessing && handleSelectPlan(plan.type)}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {isFree ? 'Para comecar' : plan.type === 'starter' ? 'Para criadores' : 'Para profissionais'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {isFree ? 'Gratis' : `R$${price}`}
                    </span>
                    {!isFree && (
                      <span className="text-muted-foreground">/mes</span>
                    )}
                    {!isFree && period === 'yearly' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cobrado R${plan.yearlyPrice}/ano
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 5 && (
                      <li className="text-sm text-muted-foreground">
                        + {plan.features.length - 5} mais recursos
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isHighlighted ? 'default' : 'outline'}
                    disabled={isProcessing}
                  >
                    {isProcessing && isSelected && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isFree ? 'Comecar gratis' : 'Selecionar'}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setStep('username')}
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    )
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
            disabled={pending || !isAvailable || username.length < 3}
            onClick={handleContinueToPlans}
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
