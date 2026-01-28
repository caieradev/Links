import { createClient } from '@/lib/supabase/server'
import { getAnalytics } from '@/actions/analytics'
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export const metadata = {
  title: 'Analytics - Links',
  description: 'Visualize estatisticas da sua pagina',
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: flags } = await supabase
    .from('feature_flags')
    .select('can_view_analytics')
    .eq('user_id', user.id)
    .single()

  const canViewAnalytics = flags?.can_view_analytics ?? false

  if (!canViewAnalytics) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Visualize estatisticas detalhadas da sua pagina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Recurso Pro</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Faca upgrade para o plano Pro para acessar analytics completos,
                incluindo visualizacoes de pagina, cliques em links, origens de trafego e muito mais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const analytics = await getAnalytics(30)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Ultimos 30 dias</p>
      </div>

      {analytics ? (
        <AnalyticsDashboard data={analytics} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum dado de analytics disponivel ainda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
