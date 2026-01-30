'use client'

import { useActionState, useState } from 'react'
import { login, sendMagicLink, type AuthState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

const initialState: AuthState = {}

export function LoginForm() {
  const [loginState, loginAction, loginPending] = useActionState(login, initialState)
  const [magicLinkState, magicLinkAction, magicLinkPending] = useActionState(sendMagicLink, initialState)
  const [activeTab, setActiveTab] = useState('magic-link')

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para gerenciar seus links
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            <TabsTrigger value="password">Email e Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form action={loginAction} className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link href="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                />
              </div>

              {loginState.error && (
                <p className="text-sm text-destructive">{loginState.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loginPending}>
                {loginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic-link">
            <form action={magicLinkAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {magicLinkState.error && (
                <p className="text-sm text-destructive">{magicLinkState.error}</p>
              )}
              {magicLinkState.success && (
                <p className="text-sm text-green-600">{magicLinkState.success}</p>
              )}

              <Button type="submit" className="w-full" disabled={magicLinkPending}>
                {magicLinkPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Link Mágico
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
