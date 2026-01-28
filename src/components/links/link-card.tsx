'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { GripVertical, MoreHorizontal, Pencil, Trash2, ExternalLink, BarChart2, Star } from 'lucide-react'
import { deleteLink, toggleLinkActive, toggleLinkFeatured } from '@/actions/links'
import { hasFeature } from '@/lib/feature-flags'
import { cn } from '@/lib/utils'
import type { Link, FeatureFlags, LinkSection } from '@/types/database'
import { EditLinkDialog } from './edit-link-dialog'

interface LinkCardProps {
  link: Link
  showAnalytics?: boolean
  flags: FeatureFlags | null
  sections?: LinkSection[]
}

export function LinkCard({ link, showAnalytics = false, flags, sections = [] }: LinkCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const canUseFeaturedLinks = hasFeature(flags, 'can_use_featured_links')

  const handleToggleActive = () => {
    startTransition(async () => {
      await toggleLinkActive(link.id, !link.is_active)
    })
  }

  const handleToggleFeatured = () => {
    startTransition(async () => {
      await toggleLinkFeatured(link.id, !link.is_featured)
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLink(link.id)
      setIsDeleteOpen(false)
    })
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'transition-all',
          isDragging && 'opacity-50 shadow-lg',
          !link.is_active && 'opacity-60'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {link.is_featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
                <h3 className="font-medium truncate">{link.title}</h3>
                {!link.is_active && (
                  <span className="text-xs text-muted-foreground">(inativo)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{link.url}</p>
              {link.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {link.description}
                </p>
              )}
            </div>

            {showAnalytics && (
              <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                <BarChart2 className="h-4 w-4" />
                <span className="text-sm">{link.click_count}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={link.is_active}
                onCheckedChange={handleToggleActive}
                disabled={isPending}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  {canUseFeaturedLinks && (
                    <DropdownMenuItem onClick={handleToggleFeatured}>
                      <Star className={cn("mr-2 h-4 w-4", link.is_featured && "fill-yellow-500 text-yellow-500")} />
                      {link.is_featured ? 'Remover destaque' : 'Destacar'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir link
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deletar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditLinkDialog
        link={link}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        flags={flags}
        sections={sections}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Deletar link"
        description={`Tem certeza que deseja deletar o link "${link.title}"? Esta acao não pode ser desfeita.`}
        confirmText="Deletar"
        variant="destructive"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  )
}
