'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { createLink, uploadLinkThumbnail, type LinkActionState } from '@/actions/links'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { ImageCropper } from '@/components/ui/image-cropper'
import { Plus, Loader2, ImageIcon, Trash2 } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import type { FeatureFlags, LinkSection } from '@/types/database'

interface CreateLinkDialogProps {
  flags: FeatureFlags | null
  sections?: LinkSection[]
}

const initialState: LinkActionState = {}

export function CreateLinkDialog({ flags }: CreateLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createLink, initialState)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isUploading, startUpload] = useTransition()

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const canUseThumbnails = hasFeature(flags, 'can_use_link_thumbnails')

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      setThumbnailUrl(null)
    }
  }, [state.success])

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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar novo link</DialogTitle>
            <DialogDescription>
              Adicione um novo link a sua pagina.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="space-y-4">
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl || ''} />

            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                name="title"
                placeholder="Meu Site"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="meusite.com ou https://meusite.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descricao (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Uma breve descricao do link"
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
                      htmlFor="thumbnail"
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
                        id="thumbnail"
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar
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
