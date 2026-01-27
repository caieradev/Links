import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export const metadata = {
  title: 'Entrar - Links',
  description: 'Entre na sua conta para gerenciar seus links',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="text-3xl font-bold mb-8">
        Links
      </Link>
      <LoginForm />
    </div>
  )
}
