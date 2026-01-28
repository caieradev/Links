'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { applyTheme } from '@/actions/appearance'
import { themes, type Theme } from '@/lib/themes'
import { hasFeature } from '@/lib/feature-flags'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Check, Lock, Loader2 } from 'lucide-react'
import type { FeatureFlags } from '@/types/database'

interface ThemeSelectorProps {
  flags: FeatureFlags | null
  currentSettings?: {
    background_type?: string
    background_color?: string
    background_gradient_start?: string | null
    background_gradient_end?: string | null
  }
}

export function ThemeSelector({ flags, currentSettings }: ThemeSelectorProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const canUseThemes = hasFeature(flags, 'can_use_themes')

  const isThemeActive = (theme: Theme): boolean => {
    if (!currentSettings) return false

    const settings = theme.settings
    if (settings.background_type !== currentSettings.background_type) return false

    if (settings.background_type === 'solid') {
      return settings.background_color === currentSettings.background_color
    }

    if (settings.background_type === 'gradient') {
      return (
        settings.background_gradient_start === currentSettings.background_gradient_start &&
        settings.background_gradient_end === currentSettings.background_gradient_end
      )
    }

    return false
  }

  const handleApplyTheme = (themeId: string) => {
    if (!canUseThemes) {
      toast.error('Faca upgrade para usar temas prontos')
      return
    }

    startTransition(async () => {
      const result = await applyTheme(themeId)
      if (result.success) {
        toast.success(result.success)
        router.refresh()
      } else if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Temas Prontos</h3>
          <p className="text-xs text-muted-foreground">
            Escolha um tema para aplicar instantaneamente
          </p>
        </div>
        {!canUseThemes && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Starter+
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {themes.map((theme) => {
          const isActive = isThemeActive(theme)
          return (
            <button
              key={theme.id}
              onClick={() => handleApplyTheme(theme.id)}
              disabled={isPending}
              className={cn(
                'relative group rounded-lg overflow-hidden border-2 transition-all',
                'hover:scale-105 hover:shadow-md',
                isActive ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent',
                !canUseThemes && 'opacity-60 cursor-not-allowed',
                isPending && 'opacity-50 pointer-events-none'
              )}
            >
              <div
                className="aspect-[3/4] p-2 flex flex-col items-center justify-center gap-1"
                style={{ background: theme.preview.background }}
              >
                {/* Mini avatar */}
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.preview.button }}
                />
                {/* Mini buttons */}
                <div className="space-y-1 w-full px-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: theme.preview.button }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white opacity-0 group-hover:opacity-100" />
                ) : isActive ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : null}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <p className="text-[10px] text-white text-center truncate">
                  {theme.name}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
