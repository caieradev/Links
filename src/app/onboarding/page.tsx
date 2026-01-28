import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata = {
  title: 'Escolha seu username - Links',
  description: 'Escolha um username para sua página de links',
}

interface OnboardingPageProps {
  searchParams: Promise<{ plan?: string; period?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams
  const plan = params?.plan
  const period = params?.period

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="text-3xl font-bold mb-8">Links</div>
      <OnboardingForm plan={plan} period={period} />
    </div>
  )
}
