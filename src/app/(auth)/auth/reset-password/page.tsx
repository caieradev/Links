import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Redefinir senha - Links',
  description: 'Crie uma nova senha para sua conta',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="linksnabio" width={280} height={64} className="h-16 w-auto" />
      </Link>
      <ResetPasswordForm />
    </div>
  )
}
