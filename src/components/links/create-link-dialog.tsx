'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { createLink, uploadLinkThumbnail, uploadLinkCoverImage, type LinkActionState } from '@/actions/links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2, ImageIcon, Trash2, Mail } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import type { FeatureFlags, LinkSection } from '@/types/database'

interface CreateLinkDialogProps {
  flags: FeatureFlags | null
  sections?: LinkSection[]
}

const initialState: LinkActionState = {}

export function CreateLinkDialog({ flags, sections = [] }: CreateLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createLink, initialState)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [requiresEmail, setRequiresEmail] = useState(false)
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [isUploading, startUpload] = useTransition()
  const [isUploadingCover, startUploadCover] = useTransition()
  const [formKey, setFormKey] = useState(0)

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [coverCropperOpen, setCoverCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null)

  const canUseThumbnails = hasFeature(flags, 'can_use_link_thumbnails')
  const canUseSections = hasFeature(flags, 'can_use_link_sections')
  const canUseCoverImages = hasFeature(flags, 'can_use_link_cover_images')
  const canUseLeadGate = hasFeature(flags, 'can_use_lead_gate')

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      setThumbnailUrl(null)
      setCoverImageUrl(null)
      setRequiresEmail(false)
      setSectionId(null)
      setFormKey(prev => prev + 1)
    }
  }, [state.success])

  // Reset state when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setThumbnailUrl(null)
      setCoverImageUrl(null)
      setRequiresEmail(false)
      setSectionId(null)
      setFormKey(prev => prev + 1)
    }
  }

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

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedCoverImage(reader.result as string)
      setCoverCropperOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCoverCropComplete = async (croppedBlob: Blob) => {
    startUploadCover(async () => {
      const file = new File([croppedBlob], 'cover.jpg', { type: 'image/jpeg' })
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadLinkCoverImage(formData)
      if (result.url) {
        setCoverImageUrl(result.url)
      }
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Link
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar novo link</DialogTitle>
            <DialogDescription>
              Adicione um novo link à sua página.
            </DialogDescription>
          </DialogHeader>
          <form key={formKey} action={action} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl || ''} />
            <input type="hidden" name="cover_image_url" value={coverImageUrl || ''} />
            <input type="hidden" name="requires_email" value={String(requiresEmail)} />
            <input type="hidden" name="section_id" value={sectionId || ''} />

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
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
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Uma breve descrição do link"
                rows={2}
              />
            </div>

            {canUseSections && sections.length > 0 && (
              <div className="space-y-2">
                <Label>Seção</Label>
                <Select
                  value={sectionId || 'none'}
                  onValueChange={(value) => setSectionId(value === 'none' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem seção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem seção</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {canUseThumbnails && (
              <div className="space-y-2">
                <Label>Imagem (opcional)</Label>
                {thumbnailUrl ? (
                  <div className="relative">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setThumbnailUrl(null)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="thumbnail"
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center py-2">
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Clique para adicionar
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

            {canUseCoverImages && (
              <div className="space-y-2">
                <Label>Imagem de capa (opcional)</Label>
                <p className="text-xs text-muted-foreground">
                  Imagem grande exibida acima do link (16:9)
                </p>
                {coverImageUrl ? (
                  <div className="relative">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-28 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setCoverImageUrl(null)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="cover"
                      className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center py-2">
                        {isUploadingCover ? (
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Clique para adicionar capa
                            </p>
                          </>
                        )}
                      </div>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageSelect}
                        disabled={isUploadingCover}
                      />
                    </Label>
                  </div>
                )}
              </div>
            )}

            {canUseLeadGate && (
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    Capturar email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Exigir email antes de acessar
                  </p>
                </div>
                <Switch
                  checked={requiresEmail}
                  onCheckedChange={setRequiresEmail}
                />
              </div>
            )}

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <DialogFooter className="pt-2">
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

      {selectedCoverImage && (
        <ImageCropper
          open={coverCropperOpen}
          onOpenChange={setCoverCropperOpen}
          imageSrc={selectedCoverImage}
          onCropComplete={handleCoverCropComplete}
          aspectRatio={16/9}
          circularCrop={false}
          outputWidth={800}
        />
      )}
    </>
  )
}
