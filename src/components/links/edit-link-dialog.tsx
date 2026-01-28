'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { updateLink, uploadLinkThumbnail, uploadLinkCoverImage, type LinkActionState } from '@/actions/links'
import { assignLinkToSection } from '@/actions/link-sections'
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
} from '@/components/ui/dialog'
import { ImageCropper } from '@/components/ui/image-cropper'
import { Switch } from '@/components/ui/switch'
import { Loader2, ImageIcon, Trash2, Mail } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import { toast } from 'sonner'
import type { Link, FeatureFlags, LinkSection } from '@/types/database'

interface EditLinkDialogProps {
  link: Link
  open: boolean
  onOpenChange: (open: boolean) => void
  flags: FeatureFlags | null
  sections?: LinkSection[]
}

const initialState: LinkActionState = {}

export function EditLinkDialog({ link, open, onOpenChange, flags, sections = [] }: EditLinkDialogProps) {
  const [state, action, pending] = useActionState(updateLink, initialState)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(link.thumbnail_url)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(link.cover_image_url)
  const [requiresEmail, setRequiresEmail] = useState<boolean>(link.requires_email)
  const [sectionId, setSectionId] = useState<string | null>(link.section_id)
  const [isUploading, startUpload] = useTransition()
  const [isUploadingCover, startUploadCover] = useTransition()
  const [isAssigning, startAssigning] = useTransition()

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [coverCropperOpen, setCoverCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null)

  const canUseThumbnails = hasFeature(flags, 'can_use_link_thumbnails')
  const canUseSections = hasFeature(flags, 'can_use_link_sections')
  const canUseCoverImages = hasFeature(flags, 'can_use_link_cover_images')
  const canUseLeadGate = hasFeature(flags, 'can_use_lead_gate')

  // Reset state when link changes
  useEffect(() => {
    setThumbnailUrl(link.thumbnail_url)
    setCoverImageUrl(link.cover_image_url)
    setRequiresEmail(link.requires_email)
    setSectionId(link.section_id)
  }, [link.thumbnail_url, link.cover_image_url, link.requires_email, link.section_id])

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar link</DialogTitle>
            <DialogDescription>
              Edite as informações do seu link.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={link.id} />
            <input type="hidden" name="is_active" value={String(link.is_active)} />
            <input type="hidden" name="thumbnail_url" value={thumbnailUrl || ''} />
            <input type="hidden" name="cover_image_url" value={coverImageUrl || ''} />
            <input type="hidden" name="requires_email" value={String(requiresEmail)} />

            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
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
                defaultValue={link.url}
                placeholder="exemplo.com ou https://exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={link.description || ''}
                rows={2}
              />
            </div>

            {canUseSections && sections.length > 0 && (
              <div className="space-y-2">
                <Label>Seção</Label>
                <Select
                  value={sectionId || 'none'}
                  onValueChange={(value) => {
                    const newSectionId = value === 'none' ? null : value
                    setSectionId(newSectionId)
                    startAssigning(async () => {
                      const result = await assignLinkToSection(link.id, newSectionId)
                      if (result.success) {
                        toast.success(result.success)
                      } else if (result.error) {
                        toast.error(result.error)
                      }
                    })
                  }}
                  disabled={isAssigning}
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
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setCoverImageUrl(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="edit-cover"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploadingCover ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Clique para adicionar capa
                            </p>
                          </>
                        )}
                      </div>
                      <Input
                        id="edit-cover"
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
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Capturar email
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Exigir email antes de acessar o link
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
