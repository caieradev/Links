'use client'

import { useState, useActionState } from 'react'
import { Plus, Trash2, GripVertical, Pencil, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasFeature } from '@/lib/feature-flags'
import Link from 'next/link'
import {
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  type SocialLinkActionState,
} from '@/actions/social-links'
import { SOCIAL_PLATFORMS } from '@/lib/social-platforms'
import { getSocialIconSvg } from '@/lib/social-icons'
import type { SocialLink, FeatureFlags } from '@/types/database'

interface SocialLinksManagerProps {
  socialLinks: SocialLink[]
  flags: FeatureFlags | null
}

export function SocialLinksManager({ socialLinks, flags }: SocialLinksManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null)

  const [createState, createAction, isCreating] = useActionState<SocialLinkActionState, FormData>(
    createSocialLink,
    {}
  )

  const [updateState, updateAction, isUpdating] = useActionState<SocialLinkActionState, FormData>(
    updateSocialLink,
    {}
  )

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este link social?')) {
      await deleteSocialLink(id)
    }
  }

  const handleCreateSuccess = () => {
    if (createState.success) {
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateSuccess = () => {
    if (updateState.success) {
      setEditingLink(null)
    }
  }

  // Check for success and close dialogs
  if (createState.success && isAddDialogOpen) {
    setTimeout(() => setIsAddDialogOpen(false), 100)
  }
  if (updateState.success && editingLink) {
    setTimeout(() => setEditingLink(null), 100)
  }

  const canUseSocialButtons = hasFeature(flags, 'can_use_social_buttons')

  if (!canUseSocialButtons) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Recurso Premium</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Os links sociais estao disponíveis a partir do plano Starter.
            Adicione ícones de suas redes sociais na sua página.
          </p>
          <Button asChild>
            <Link href="/settings">Fazer Upgrade</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Links Sociais</CardTitle>
              <CardDescription>
                Adicione ícones de suas redes sociais
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Link Social</DialogTitle>
                </DialogHeader>
                <form action={createAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Plataforma</Label>
                    <Select name="platform" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            <div className="flex items-center gap-2">
                              {getSocialIconSvg(platform.value) && (
                                <div
                                  className="w-4 h-4"
                                  dangerouslySetInnerHTML={{ __html: getSocialIconSvg(platform.value)! }}
                                />
                              )}
                              {platform.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>URL do seu perfil</Label>
                    <Input
                      name="url"
                      placeholder="instagram.com/seuperfil"
                      required
                    />
                  </div>

                  {createState.error && (
                    <p className="text-sm text-red-500">{createState.error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {socialLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum link social adicionado</p>
              <p className="text-sm">Clique em "Adicionar" para começar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {socialLinks.map((link) => {
                const iconSvg = getSocialIconSvg(link.platform)
                const platformLabel = SOCIAL_PLATFORMS.find((p) => p.value === link.platform)?.label || link.platform

                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                    {iconSvg && (
                      <div
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                      >
                        <div
                          className="w-4 h-4"
                          dangerouslySetInnerHTML={{ __html: iconSvg }}
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{platformLabel}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingLink(link)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Link Social</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={editingLink.id} />

              <div className="space-y-2">
                <Label>Plataforma</Label>
                <Select name="platform" defaultValue={editingLink.platform} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center gap-2">
                          {getSocialIconSvg(platform.value) && (
                            <div
                              className="w-4 h-4"
                              dangerouslySetInnerHTML={{ __html: getSocialIconSvg(platform.value)! }}
                            />
                          )}
                          {platform.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>URL do seu perfil</Label>
                <Input
                  name="url"
                  defaultValue={editingLink.url}
                  placeholder="instagram.com/seuperfil"
                  required
                />
              </div>

              {updateState.error && (
                <p className="text-sm text-red-500">{updateState.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
