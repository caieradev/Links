import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Criar Conta - Links',
  description: 'Crie sua conta para começar a compartilhar seus links',
}

interface RegisterPageProps {
  searchParams: Promise<{ plan?: string; period?: string }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const plan = params?.plan
  const period = params?.period

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Link href="/" className="mb-8">
        <Image src="/logo.png" alt="linksnabio" width={280} height={64} className="h-16 w-auto" />
      </Link>
      <RegisterForm plan={plan} period={period} />
    </div>
  )
}
