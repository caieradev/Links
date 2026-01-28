import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import Link from 'next/link'

export const metadata = {
  title: 'Redefinir senha - Links',
  description: 'Crie uma nova senha para sua conta',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="text-3xl font-bold mb-8">
        Links
      </Link>
      <ResetPasswordForm />
    </div>
  )
}
