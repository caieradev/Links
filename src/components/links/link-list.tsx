'use client'

import { useState, useTransition, useEffect } from 'react'
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
} from '@dnd-kit/sortable'
import { LinkCard } from './link-card'
import { reorderLinks } from '@/actions/links'
import type { Link, FeatureFlags } from '@/types/database'

interface LinkListProps {
  initialLinks: Link[]
  showAnalytics?: boolean
  flags: FeatureFlags | null
}

export function LinkList({ initialLinks, showAnalytics = false, flags }: LinkListProps) {
  const [links, setLinks] = useState(initialLinks)
  const [, startTransition] = useTransition()

  // Sync local state when initialLinks changes (after server actions)
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        // Save new order to database
        startTransition(async () => {
          await reorderLinks(newItems.map((item) => item.id))
        })

        return newItems
      })
    }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Voce ainda nao tem nenhum link.</p>
        <p className="text-sm">Clique em &quot;Adicionar Link&quot; para comecar.</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={links} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {links.map((link) => (
            <LinkCard key={link.id} link={link} showAnalytics={showAnalytics} flags={flags} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
