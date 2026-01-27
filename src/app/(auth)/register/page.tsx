import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export const metadata = {
  title: 'Criar Conta - Links',
  description: 'Crie sua conta para comecar a compartilhar seus links',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="text-3xl font-bold mb-8">
        Links
      </Link>
      <RegisterForm />
    </div>
  )
}
