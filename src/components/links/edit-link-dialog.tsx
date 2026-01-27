'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { updateLink, uploadLinkThumbnail, type LinkActionState } from '@/actions/links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageCropper } from '@/components/ui/image-cropper'
import { Loader2, ImageIcon, Trash2 } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import type { Link, FeatureFlags } from '@/types/database'

interface EditLinkDialogProps {
  link: Link
  open: boolean
  onOpenChange: (open: boolean) => void
  flags: FeatureFlags | null
}

const initialState: LinkActionState = {}

export function EditLinkDialog({ link, open, onOpenChange, flags }: EditLinkDialogProps) {
  const [state, action, pending] = useActionState(updateLink, initialState)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(link.thumbnail_url)
  const [isUploading, startUpload] = useTransition()

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const canUseThumbnails = hasFeature(flags, 'can_use_link_thumbnails')

  // Reset thumbnail when link changes
  useEffect(() => {
    setThumbnailUrl(link.thumbnail_url)
  }, [link.thumbnail_url])

  useEffect(() => {
    if (state.success) {
      onOpenChange(false)
    }
  }, [state.success, onOpenChange])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    startUpload(async () => {
      const file = new File([croppedBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadLinkThumbnail(formData)
      if (result.url) {
        setThumbnailUrl(result.url)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar link</DialogTitle>
            <DialogDescription>
              Edite as informacoes do seu link.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="is_active" value={String(link.is_active)} />
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl || ''} />

            <div className="space-y-2">
              <Label htmlFor="edit-title">Titulo</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={link.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                name="url"
                type="url"
                defaultValue={link.url}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descricao (opcional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={link.description || ''}
                rows={2}
              />
            </div>

            {canUseThumbnails && (
              <div className="space-y-2">
                <Label>Imagem (opcional)</Label>
                {thumbnailUrl ? (
                  <div className="relative">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setThumbnailUrl(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="edit-thumbnail"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Clique para adicionar imagem
                            </p>
                          </>
                        )}
                      </div>
                      <Input
                        id="edit-thumbnail"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                        disabled={isUploading}
                      />
                    </Label>
                  </div>
                )}
              </div>
            )}

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          circularCrop={true}
          outputWidth={200}
        />
      )}
    </>
  )
}
