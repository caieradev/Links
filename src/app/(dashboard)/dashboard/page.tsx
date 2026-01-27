import { createClient } from '@/lib/supabase/server'
import { LinkList } from '@/components/links/link-list'
import { CreateLinkDialog } from '@/components/links/create-link-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Dashboard - Links',
  description: 'Gerencie seus links',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const maxLinks = flags?.max_links ?? 10
  const canViewAnalytics = flags?.can_view_analytics ?? false
  const linksCount = links?.length ?? 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seus Links</CardTitle>
              <CardDescription>
                Gerencie os links da sua pagina
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {linksCount}/{maxLinks} links
              </Badge>
              <CreateLinkDialog flags={flags} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LinkList
            initialLinks={links ?? []}
            showAnalytics={canViewAnalytics}
            flags={flags}
          />
        </CardContent>
      </Card>
    </div>
  )
}
