'use client'

import { useState, useTransition, useActionState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { createSection, updateSection, deleteSection, reorderSections, type SectionActionState } from '@/actions/link-sections'
import { toast } from 'sonner'
import { FolderPlus, MoreHorizontal, Pencil, Trash2, Loader2, Lock, GripVertical } from 'lucide-react'
import type { LinkSection, FeatureFlags } from '@/types/database'

interface SortableSectionItemProps {
  section: LinkSection
  isEditing: boolean
  editTitle: string
  setEditTitle: (title: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEdit: (section: LinkSection) => void
  onDelete: (id: string) => void
  isPending: boolean
}

function SortableSectionItem({
  section,
  isEditing,
  editTitle,
  setEditTitle,
  onSaveEdit,
  onCancelEdit,
  onEdit,
  onDelete,
  isPending,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 rounded-lg border bg-card"
    >
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="h-8"
            maxLength={50}
          />
          <Button
            size="sm"
            onClick={onSaveEdit}
            disabled={isPending}
          >
            Salvar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelEdit}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="font-medium">{section.title}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(section)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(section.id)}
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
  )
}

interface SectionManagerProps {
  sections: LinkSection[]
  flags: FeatureFlags | null
}

export function SectionManager({ sections: initialSections, flags }: SectionManagerProps) {
  const [sections, setSections] = useState(initialSections)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<LinkSection | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Sync local state when initialSections changes
  useEffect(() => {
    setSections(initialSections)
  }, [initialSections])

  const canUseSections = flags?.can_use_link_sections ?? false

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id)
      const newIndex = sections.findIndex((item) => item.id === over.id)
      const newItems = arrayMove(sections, oldIndex, newIndex)

      // Update local state immediately
      setSections(newItems)

      // Save new order to database
      startTransition(async () => {
        await reorderSections(newItems.map((item) => item.id))
      })
    }
  }

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
        <span>Seções disponiveis no Starter+</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Seções</h3>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              Nova seção
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar seção</DialogTitle>
              <DialogDescription>
                Organize seus links em seções com títulos
              </DialogDescription>
            </DialogHeader>
            <form action={createAction} className="space-y-4">
              <Input
                name="title"
                placeholder="Nome da seção"
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
          Nenhuma seção criada ainda.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  isEditing={editingSection?.id === section.id}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingSection(null)}
                  onEdit={handleEdit}
                  onDelete={openDeleteDialog}
                  isPending={isPending}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar seção?"
        description="Os links desta seção não serão deletados, apenas ficaran sem seção."
        onConfirm={handleDelete}
        loading={isPending}
        variant="destructive"
      />
    </div>
  )
}
