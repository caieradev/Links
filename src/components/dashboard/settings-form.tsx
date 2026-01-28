'use client'

import { useActionState, useTransition, useState } from 'react'
import { updateProfile, addCustomDomain, verifyDomain, deleteDomain, deleteAccount, type SettingsState } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Loader2, Trash2, Check, AlertCircle, Copy, Lock } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import Link from 'next/link'
import type { Profile, CustomDomain, FeatureFlags } from '@/types/database'
import { toast } from 'sonner'

interface SettingsFormProps {
  profile: Profile
  domains: CustomDomain[]
  flags: FeatureFlags | null
  appDomain: string
}

const initialState: SettingsState = {}

export function SettingsForm({ profile, domains, flags, appDomain }: SettingsFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState)
  const [domainState, domainAction, domainPending] = useActionState(addCustomDomain, initialState)
  const [isPending, startTransition] = useTransition()

  // Delete account dialog state
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Delete domain dialog state
  const [deleteDomainOpen, setDeleteDomainOpen] = useState(false)
  const [domainToDelete, setDomainToDelete] = useState<CustomDomain | null>(null)

  const canUseDomains = hasFeature(flags, 'can_use_custom_domain')

  const handleVerifyDomain = (domainId: string) => {
    startTransition(async () => {
      const result = await verifyDomain(domainId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  const handleDeleteDomain = () => {
    if (!domainToDelete) return

    startTransition(async () => {
      const result = await deleteDomain(domainToDelete.id)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
      setDeleteDomainOpen(false)
      setDomainToDelete(null)
    })
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteAccount()
      if (result?.error) {
        toast.error(result.error)
        setDeleteAccountOpen(false)
      }
      // If successful, the user will be redirected
    } catch {
      // Redirect will throw, which is expected
    } finally {
      setIsDeleting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a area de transferencia')
  }

  const openDeleteDomainDialog = (domain: CustomDomain) => {
    setDomainToDelete(domain)
    setDeleteDomainOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Informações basicas do seu perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nome de exibicao</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ''}
                placeholder="Escreva algo sobre você..."
                rows={3}
              />
            </div>

            {profileState.error && (
              <p className="text-sm text-destructive">{profileState.error}</p>
            )}
            {profileState.success && (
              <p className="text-sm text-green-600">{profileState.success}</p>
            )}

            <Button type="submit" disabled={profilePending}>
              {profilePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* URL Info */}
      <Card>
        <CardHeader>
          <CardTitle>Sua URL</CardTitle>
          <CardDescription>Compartilhe sua página de links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-sm">
              {appDomain}/{profile.username}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(`${appDomain}/${profile.username}`)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domains */}
      {canUseDomains ? (
        <Card>
          <CardHeader>
            <CardTitle>Domínios Customizados</CardTitle>
            <CardDescription>Use seu próprio domínio para sua página</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {domains.length > 0 && (
              <div className="space-y-3">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{domain.domain}</span>
                      {domain.is_verified ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!domain.is_verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={isPending}
                        >
                          Verificar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDomainDialog(domain)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {domains.some((d) => !d.is_verified) && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-medium">Configuracao DNS</h4>
                <p className="text-sm text-muted-foreground">
                  Para verificar seu domínio, adicione o seguinte registro DNS no seu provedor:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-background rounded border">
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground text-xs mb-1">
                      <span>Tipo</span>
                      <span>Nome</span>
                      <span>Valor</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono">
                      <span>CNAME</span>
                      <span>@ ou www</span>
                      <span className="break-all">cname.vercel-dns.com</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A propagacao do DNS pode levar ate 48 horas. Apos configurar, clique em &quot;Verificar&quot;.
                  </p>
                </div>
              </div>
            )}

            <form action={domainAction} className="flex gap-2">
              <Input
                name="domain"
                placeholder="seu-domínio.com"
              />
              <Button type="submit" disabled={domainPending}>
                {domainPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar
              </Button>
            </form>

            {domainState.error && (
              <p className="text-sm text-destructive">{domainState.error}</p>
            )}
            {domainState.success && (
              <p className="text-sm text-green-600">{domainState.success}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Recurso Premium</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Os domínios customizados estao disponíveis a partir do plano Pro.
              Use seu próprio domínio para sua página de links.
            </p>
            <Button asChild>
              <Link href="/pricing">Fazer Upgrade</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>Acoes irreversiveis para sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Deletar conta</h4>
              <p className="text-sm text-muted-foreground">
                Todos os seus dados serao permanentemente deletados
              </p>
            </div>
            <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Domain Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDomainOpen}
        onOpenChange={setDeleteDomainOpen}
        title="Remover domínio"
        description={`Tem certeza que deseja remover o domínio "${domainToDelete?.domain}"? Você precisara configura-lo novamente se quiser usa-lo no futuro.`}
        confirmText="Remover"
        variant="destructive"
        onConfirm={handleDeleteDomain}
        loading={isPending}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Deletar conta permanentemente"
        description="Esta acao e irreversivel. Todos os seus links, configuraçãooes e dados serao permanentemente deletados. Você tem certeza absoluta?"
        confirmText="Sim, deletar minha conta"
        variant="destructive"
        onConfirm={handleDeleteAccount}
        loading={isDeleting}
      />
    </div>
  )
}
