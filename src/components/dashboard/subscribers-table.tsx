'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteSubscriber, exportSubscribersCSV } from '@/actions/subscribers'
import { toast } from 'sonner'
import { Download, Search, Trash2, Loader2 } from 'lucide-react'
import type { Subscriber } from '@/types/database'

interface SubscribersTableProps {
  subscribers: Subscriber[]
}

export function SubscribersTable({ subscribers }: SubscribersTableProps) {
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isExporting, setIsExporting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null)

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      (sub.name && sub.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = async () => {
    if (!subscriberToDelete) return
    startTransition(async () => {
      const result = await deleteSubscriber(subscriberToDelete)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.success)
      }
      setDeleteDialogOpen(false)
      setSubscriberToDelete(null)
    })
  }

  const openDeleteDialog = (id: string) => {
    setSubscriberToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportSubscribersCSV()
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `inscritos-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('CSV exportado com sucesso')
      }
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nenhum inscrito ainda.</p>
        <p className="text-sm mt-2">
          Habilite o formulario de inscrição em Aparência para começar a coletar emails.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>{subscriber.name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(subscriber.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isPending}
                    onClick={() => openDeleteDialog(subscriber.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredSubscribers.length === 0 && search && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Nenhum resultado para &quot;{search}&quot;
        </p>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remover inscrito?"
        description="Esta acao não pode ser desfeita."
        onConfirm={handleDelete}
        loading={isPending}
        variant="destructive"
      />
    </div>
  )
}
