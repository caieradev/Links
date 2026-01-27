'use client'

import { useActionState, useState, useTransition } from 'react'
import { completeOnboarding, checkUsernameAvailability, type AuthState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect } from 'react'

const initialState: AuthState = {}

export function OnboardingForm() {
  const [state, action, pending] = useActionState(completeOnboarding, initialState)
  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, startTransition] = useTransition()
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Escolha seu username</CardTitle>
        <CardDescription>
          Seu username sera usado na URL da sua pagina de links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
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
            type="submit"
            className="w-full"
            disabled={pending || !isAvailable || username.length < 3}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continuar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
