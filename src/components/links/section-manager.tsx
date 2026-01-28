'use client'

import { useState, useTransition, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { createSection, updateSection, deleteSection, type SectionActionState } from '@/actions/link-sections'
import { toast } from 'sonner'
import { FolderPlus, MoreHorizontal, Pencil, Trash2, Loader2, Lock } from 'lucide-react'
import type { LinkSection, FeatureFlags } from '@/types/database'

interface SectionManagerProps {
  sections: LinkSection[]
  flags: FeatureFlags | null
}

export function SectionManager({ sections, flags }: SectionManagerProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<LinkSection | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const canUseSections = flags?.can_use_link_sections ?? false

  const [createState, createAction, isCreating] = useActionState<SectionActionState, FormData>(
    async (prevState, formData) => {
      const result = await createSection(prevState, formData)
      if (result.success) {
        setCreateOpen(false)
        toast.success(result.success)
      } else if (result.error) {
        toast.error(result.error)
      }
      return result
    },
    {}
  )

  const handleEdit = (section: LinkSection) => {
    setEditingSection(section)
    setEditTitle(section.title)
  }

  const handleSaveEdit = async () => {
    if (!editingSection) return
    startTransition(async () => {
      const result = await updateSection(editingSection.id, editTitle)
      if (result.success) {
        setEditingSection(null)
        toast.success(result.success)
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = async () => {
    if (!sectionToDelete) return
    startTransition(async () => {
      const result = await deleteSection(sectionToDelete)
      if (result.success) {
        toast.success(result.success)
      } else if (result.error) {
        toast.error(result.error)
      }
      setDeleteDialogOpen(false)
      setSectionToDelete(null)
    })
  }

  const openDeleteDialog = (id: string) => {
    setSectionToDelete(id)
    setDeleteDialogOpen(true)
  }

  if (!canUseSections) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Secoes disponiveis no Starter+</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Secoes</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              Nova secao
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar secao</DialogTitle>
              <DialogDescription>
                Organize seus links em secoes com titulos
              </DialogDescription>
            </DialogHeader>
            <form action={createAction} className="space-y-4">
              <Input
                name="title"
                placeholder="Nome da secao"
                required
                maxLength={50}
              />
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma secao criada ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              {editingSection?.id === section.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8"
                    maxLength={50}
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isPending}
                  >
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingSection(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium">{section.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(section)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(section.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar secao?"
        description="Os links desta secao nao serao deletados, apenas ficaran sem secao."
        onConfirm={handleDelete}
        loading={isPending}
        variant="destructive"
      />
    </div>
  )
}
