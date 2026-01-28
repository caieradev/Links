'use client'

import { useActionState, useTransition, useState } from 'react'
import { updatePageSettings, uploadAvatar, uploadBackground, type AppearanceState } from '@/actions/appearance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageCropper } from '@/components/ui/image-cropper'
import { FeatureGate } from './feature-gate'
import { ThemeSelector } from './appearance/theme-selector'
import { RedirectSettings } from './appearance/redirect-settings'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, ImageIcon, Trash2, Lock } from 'lucide-react'
import { hasFeature } from '@/lib/feature-flags'
import type { Profile, PageSettings, FeatureFlags } from '@/types/database'

interface AppearanceFormProps {
  profile: Profile
  settings: PageSettings
  flags: FeatureFlags | null
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /^([^"&?\/\s]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const initialState: AppearanceState = {}

const fonts = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
]

const linkStyles = [
  { value: 'rounded', label: 'Arredondado' },
  { value: 'pill', label: 'Pilula' },
  { value: 'square', label: 'Quadrado' },
  { value: 'outline', label: 'Contorno' },
]

const animations = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'bounce', label: 'Bounce' },
]

const avatarSizes = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Medio' },
  { value: 'large', label: 'Grande' },
]

export function AppearanceForm({ profile, settings, flags }: AppearanceFormProps) {
  const [state, action, pending] = useActionState(updatePageSettings, initialState)
  const [isUploading, startUpload] = useTransition()
  const [isUploadingBg, startUploadBg] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(settings.background_image_url)

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [cropperType, setCropperType] = useState<'avatar' | 'background'>('avatar')

  const [formData, setFormData] = useState({
    background_type: settings.background_type,
    background_color: settings.background_color,
    background_gradient_start: settings.background_gradient_start || '#ffffff',
    background_gradient_end: settings.background_gradient_end || '#000000',
    background_gradient_direction: settings.background_gradient_direction,
    background_blur: settings.background_blur,
    text_color: settings.text_color,
    link_background_color: settings.link_background_color,
    link_text_color: settings.link_text_color,
    link_hover_color: settings.link_hover_color,
    font_family: settings.font_family,
    link_style: settings.link_style,
    link_shadow: settings.link_shadow,
    show_avatar: settings.show_avatar,
    show_bio: settings.show_bio,
    avatar_size: settings.avatar_size,
    link_animation: settings.link_animation,
    subscriber_form_enabled: settings.subscriber_form_enabled,
    subscriber_form_title: settings.subscriber_form_title,
    subscriber_form_description: settings.subscriber_form_description || '',
    header_video_url: settings.header_video_url || '',
    social_icons_position: settings.social_icons_position || 'hidden',
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'background') => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setCropperType(type)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (cropperType === 'avatar') {
      startUpload(async () => {
        const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadAvatar(formData)
        if (result.url) {
          setAvatarUrl(result.url + '?t=' + Date.now()) // Cache bust
        }
      })
    } else {
      startUploadBg(async () => {
        const file = new File([croppedBlob], 'background.jpg', { type: 'image/jpeg' })
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadBackground(formData)
        if (result.url) {
          setBackgroundImageUrl(result.url + '?t=' + Date.now()) // Cache bust
          setFormData(prev => ({ ...prev, background_type: 'image' }))
        }
      })
    }
  }

  const canUseColors = hasFeature(flags, 'can_use_custom_colors')
  const canUseGradients = hasFeature(flags, 'can_use_gradients')
  const canUseFonts = hasFeature(flags, 'can_use_custom_fonts')
  const canUseAnimations = hasFeature(flags, 'can_use_animations')

  return (
    <>
      <form action={action} className="space-y-6">
        {/* Hidden fields */}
        {Object.entries(formData).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={String(value)} />
        ))}
        <input type="hidden" name="background_image_url" value={backgroundImageUrl || ''} />

        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="background">Fundo</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="subscribers">Inscritos</TabsTrigger>
            <TabsTrigger value="advanced">Avancado</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>Sua foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback>
                      {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-md hover:bg-secondary/80 transition-colors">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Enviar foto
                      </div>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageSelect(e, 'avatar')}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar avatar</Label>
                    <p className="text-sm text-muted-foreground">Exibir seu avatar na página</p>
                  </div>
                  <Switch
                    checked={formData.show_avatar}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, show_avatar: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar bio</Label>
                    <p className="text-sm text-muted-foreground">Exibir sua bio na página</p>
                  </div>
                  <Switch
                    checked={formData.show_bio}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, show_bio: checked }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tamanho do avatar</Label>
                  <Select
                    value={formData.avatar_size}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, avatar_size: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {avatarSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Texto</CardTitle>
                <CardDescription>Cores e fontes do texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cor do texto</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, text_color: e.target.value }))
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={!canUseColors}
                    />
                    <Input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, text_color: e.target.value }))
                      }
                      disabled={!canUseColors}
                    />
                  </div>
                </div>

                <FeatureGate flags={flags} feature="can_use_custom_fonts">
                  <div className="space-y-2">
                    <Label>Fonte</Label>
                    <Select
                      value={formData.font_family}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, font_family: value }))
                      }
                      disabled={!canUseFonts}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FeatureGate>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Temas</CardTitle>
                <CardDescription>Aplique um tema pronto ou personalize manualmente</CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSelector
                  flags={flags}
                  currentSettings={{
                    background_type: formData.background_type,
                    background_color: formData.background_color,
                    background_gradient_start: formData.background_gradient_start,
                    background_gradient_end: formData.background_gradient_end,
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipo de fundo</CardTitle>
                <CardDescription>Escolha o estilo do seu fundo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.background_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, background_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Cor solida</SelectItem>
                    <SelectItem value="gradient" disabled={!canUseGradients}>
                      Gradiente {!canUseGradients && '(Pro)'}
                    </SelectItem>
                    <SelectItem value="image" disabled={!hasFeature(flags, 'can_use_custom_background_image')}>
                      Imagem {!hasFeature(flags, 'can_use_custom_background_image') && '(Pro)'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {formData.background_type === 'solid' && (
                  <div className="space-y-2">
                    <Label>Cor de fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, background_color: e.target.value }))
                        }
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.background_color}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, background_color: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                )}

                {formData.background_type === 'gradient' && canUseGradients && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cor inicial</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.background_gradient_start}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              background_gradient_start: e.target.value,
                            }))
                          }
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.background_gradient_start}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              background_gradient_start: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor final</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.background_gradient_end}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              background_gradient_end: e.target.value,
                            }))
                          }
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.background_gradient_end}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              background_gradient_end: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Direcao</Label>
                      <Select
                        value={formData.background_gradient_direction}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_gradient_direction: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to bottom">Para baixo</SelectItem>
                          <SelectItem value="to top">Para cima</SelectItem>
                          <SelectItem value="to right">Para direita</SelectItem>
                          <SelectItem value="to left">Para esquerda</SelectItem>
                          <SelectItem value="to bottom right">Diagonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.background_type === 'image' && hasFeature(flags, 'can_use_custom_background_image') && (
                  <div className="space-y-4">
                    {backgroundImageUrl ? (
                      <div className="relative">
                        <img
                          src={backgroundImageUrl}
                          alt="Background preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => setBackgroundImageUrl(null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <Label
                          htmlFor="background-image"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploadingBg ? (
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Clique para enviar uma imagem
                                </p>
                              </>
                            )}
                          </div>
                          <Input
                            id="background-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageSelect(e, 'background')}
                            disabled={isUploadingBg}
                          />
                        </Label>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Desfoque</Label>
                      <Input
                        type="range"
                        min="0"
                        max="20"
                        value={formData.background_blur}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            background_blur: parseInt(e.target.value),
                          }))
                        }
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">{Math.round((formData.background_blur / 20) * 100)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estilo dos links</CardTitle>
                <CardDescription>Personalize a aparência dos seus links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Estilo</Label>
                  <Select
                    value={formData.link_style}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, link_style: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {linkStyles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cor de fundo do link</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.link_background_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          link_background_color: e.target.value,
                        }))
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={!canUseColors}
                    />
                    <Input
                      type="text"
                      value={formData.link_background_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          link_background_color: e.target.value,
                        }))
                      }
                      disabled={!canUseColors}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor do texto do link</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.link_text_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          link_text_color: e.target.value,
                        }))
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                      disabled={!canUseColors}
                    />
                    <Input
                      type="text"
                      value={formData.link_text_color}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          link_text_color: e.target.value,
                        }))
                      }
                      disabled={!canUseColors}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sombra</Label>
                    <p className="text-sm text-muted-foreground">Adicionar sombra aos links</p>
                  </div>
                  <Switch
                    checked={formData.link_shadow}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, link_shadow: checked }))
                    }
                  />
                </div>

                <FeatureGate flags={flags} feature="can_use_animations">
                  <div className="space-y-2">
                    <Label>Animacao</Label>
                    <Select
                      value={formData.link_animation}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, link_animation: value }))
                      }
                      disabled={!canUseAnimations}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {animations.map((animation) => (
                          <SelectItem key={animation.value} value={animation.value}>
                            {animation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FeatureGate>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Formulario de inscrição</CardTitle>
                <CardDescription>
                  Colete emails dos visitantes da sua página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasFeature(flags, 'can_collect_subscribers') ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Habilitar formulario</Label>
                        <p className="text-sm text-muted-foreground">
                          Exibir formulario de inscrição na sua página
                        </p>
                      </div>
                      <Switch
                        checked={formData.subscriber_form_enabled}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, subscriber_form_enabled: checked }))
                        }
                      />
                    </div>

                    {formData.subscriber_form_enabled && (
                      <>
                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            type="text"
                            value={formData.subscriber_form_title}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                subscriber_form_title: e.target.value,
                              }))
                            }
                            placeholder="Inscreva-se"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Descrição (opcional)</Label>
                          <Textarea
                            value={formData.subscriber_form_description}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                subscriber_form_description: e.target.value,
                              }))
                            }
                            placeholder="Receba novidades e conteudos exclusivos"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Lock className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Recurso disponível a partir do plano Starter
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Colete emails dos visitantes e exporte para suas ferramentas de marketing.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <RedirectSettings flags={flags} settings={settings} />

            {/* Social Icons Position */}
            <FeatureGate flags={flags} feature="can_use_social_buttons">
              <Card>
                <CardHeader>
                  <CardTitle>Ícones Sociais</CardTitle>
                  <CardDescription>
                    Configure onde os ícones das redes sociais aparecem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Posicao</Label>
                    <Select
                      value={formData.social_icons_position}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, social_icons_position: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hidden">Oculto</SelectItem>
                        <SelectItem value="above">Acima dos links</SelectItem>
                        <SelectItem value="below">Abaixo dos links</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Configure seus links sociais na página de Links Sociais
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FeatureGate>

            {/* YouTube Header Vídeo */}
            <FeatureGate flags={flags} feature="can_use_header_video">
              <Card>
                <CardHeader>
                  <CardTitle>Vídeo de Cabecalho</CardTitle>
                  <CardDescription>
                    Adicione um vídeo do YouTube no topo da sua página
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>URL do YouTube</Label>
                    <Input
                      type="url"
                      value={formData.header_video_url}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, header_video_url: e.target.value }))
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Cole a URL de um vídeo do YouTube. Deixe vazio para remover.
                    </p>
                  </div>

                  {formData.header_video_url && (
                    <div className="aspect-vídeo rounded-lg overflow-hidden border">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(formData.header_video_url) || ''}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </FeatureGate>
          </TabsContent>
        </Tabs>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600">{state.success}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </form>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={cropperType === 'avatar' ? 1 : 16 / 9}
          circularCrop={cropperType === 'avatar'}
          outputWidth={cropperType === 'avatar' ? 400 : 1920}
        />
      )}
    </>
  )
}
