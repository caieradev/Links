import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Entrar - Links',
  description: 'Entre na sua conta para gerenciar seus links',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="linksnabio" width={200} height={48} className="h-12 w-auto" />
      </Link>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm max-w-md text-center">
          {error === 'auth' ? 'Erro na autenticacao. Tente novamente.' : error}
        </div>
      )}
      <LoginForm />
    </div>
  )
}
