import { LinkList } from '@/components/links/link-list'
import { CreateLinkDialog } from '@/components/links/create-link-dialog'
import { SectionManager } from '@/components/links/section-manager'
import { SocialLinksManager } from '@/components/dashboard/social-links-manager'
import { QRCodeGenerator } from '@/components/dashboard/qr-code-generator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUser, getProfile, getFeatureFlags, getLinks, getSections, getSocialLinks } from '@/lib/supabase/queries'

export const metadata = {
  title: 'Dashboard - Links',
  description: 'Gerencie seus links',
}

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    return null
  }

  // Parallel queries - todas rodam ao mesmo tempo
  const [links, flags, profile, sections, socialLinks] = await Promise.all([
    getLinks(user.id),
    getFeatureFlags(user.id),
    getProfile(user.id),
    getSections(user.id),
    getSocialLinks(user.id),
  ])

  const maxLinks = flags?.max_links ?? null
  const canViewAnalytics = flags?.can_view_analytics ?? false
  const linksCount = links?.length ?? 0
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://links.app'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Section Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Seções</CardTitle>
          <CardDescription>
            Organize seus links em categorias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SectionManager sections={sections ?? []} flags={flags} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seus Links</CardTitle>
              <CardDescription>
                Gerencie os links da sua página
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {maxLinks !== null && (
                <Badge variant="secondary">
                  {linksCount}/{maxLinks} links
                </Badge>
              )}
              {profile?.username && (
                <QRCodeGenerator username={profile.username} appUrl={appUrl} />
              )}
              <CreateLinkDialog flags={flags} sections={sections ?? []} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LinkList
            initialLinks={links ?? []}
            showAnalytics={canViewAnalytics}
            flags={flags}
            sections={sections ?? []}
          />
        </CardContent>
      </Card>
      {/* Social Links Manager */}
      <SocialLinksManager socialLinks={socialLinks ?? []} flags={flags} />
    </div>
  )
}
