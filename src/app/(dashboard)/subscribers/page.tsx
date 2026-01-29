import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubscribersTable } from '@/components/dashboard/subscribers-table'
import { redirect } from 'next/navigation'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUser, getFeatureFlags, getSubscribersWithCount, getPageSettings } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Inscritos - Links',
  description: 'Gerencie seus inscritos',
}

export default async function SubscribersPage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const flags = await getFeatureFlags(user.id)
  const canCollectSubscribers = flags?.can_collect_subscribers ?? false

  if (!canCollectSubscribers) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recurso Premium</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              A captura de inscritos esta disponível a partir do plano Starter.
              Colete emails dos seus visitantes e exporte para suas ferramentas de marketing.
            </p>
            <Button asChild>
              <Link href="/settings">Fazer Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Parallel queries
  const [{ data: subscribers, count }, settings] = await Promise.all([
    getSubscribersWithCount(user.id),
    getPageSettings(user.id),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inscritos</CardTitle>
              <CardDescription>
                Pessoas que se inscreveram na sua página
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={settings?.subscriber_form_enabled ? 'default' : 'secondary'}>
                {settings?.subscriber_form_enabled ? 'Formulário ativo' : 'Formulário inativo'}
              </Badge>
              <Badge variant="secondary">
                {count ?? 0} inscritos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SubscribersTable subscribers={subscribers ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
