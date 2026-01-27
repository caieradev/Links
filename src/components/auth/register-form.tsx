'use client'

import { useActionState } from 'react'
import { register, type AuthState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const initialState: AuthState = {}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initialState)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar Conta</CardTitle>
        <CardDescription>
          Crie sua conta para comecar a compartilhar seus links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              required
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">{state.success}</p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Conta
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Ja tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
