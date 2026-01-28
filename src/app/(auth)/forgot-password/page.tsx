import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Esqueci minha senha - Links',
  description: 'Recupere o acesso à sua conta',
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="text-3xl font-bold mb-8">
        Links
      </Link>
      <ForgotPasswordForm />
    </div>
  )
}
