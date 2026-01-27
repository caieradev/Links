import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LinkButton } from './link-button'
import type { Profile, Link, PageSettings, FeatureFlags } from '@/types/database'
import { cn } from '@/lib/utils'

interface PublicPageProps {
  profile: Profile
  links: Link[]
  settings: PageSettings
  flags: FeatureFlags | null
}

export function PublicPage({ profile, links, settings, flags }: PublicPageProps) {
  const canRemoveBranding = flags?.can_remove_branding ?? false

  const getBackgroundStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {}

    switch (settings.background_type) {
      case 'solid':
        style.backgroundColor = settings.background_color
        break
      case 'gradient':
        style.background = `linear-gradient(${settings.background_gradient_direction}, ${settings.background_gradient_start}, ${settings.background_gradient_end})`
        break
      case 'image':
        if (settings.background_image_url) {
          style.backgroundImage = `url(${settings.background_image_url})`
          style.backgroundSize = 'cover'
          style.backgroundPosition = 'center'
          if (settings.background_blur > 0) {
            // Blur effect will be applied via overlay
          }
        }
        break
    }

    return style
  }

  const getAvatarSize = () => {
    switch (settings.avatar_size) {
      case 'small':
        return 'h-16 w-16'
      case 'large':
        return 'h-32 w-32'
      default:
        return 'h-24 w-24'
    }
  }

  const getFontFamily = () => {
    const fonts: Record<string, string> = {
      Inter: 'Inter, sans-serif',
      Roboto: 'Roboto, sans-serif',
      'Open Sans': 'Open Sans, sans-serif',
      Poppins: 'Poppins, sans-serif',
      Montserrat: 'Montserrat, sans-serif',
    }
    return fonts[settings.font_family] || fonts.Inter
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        ...getBackgroundStyle(),
        fontFamily: getFontFamily(),
      }}
    >
      {/* Blur overlay for background image */}
      {settings.background_type === 'image' && settings.background_blur > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${settings.background_blur}px)`,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
      )}

      <div className="relative z-10 container max-w-md mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          {settings.show_avatar && (
            <Avatar className={cn(getAvatarSize(), 'mb-4 border-4 border-white/20')}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || profile.username} />
              <AvatarFallback
                className="text-2xl"
                style={{ backgroundColor: settings.link_background_color, color: settings.link_text_color }}
              >
                {(profile.display_name || profile.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Display Name */}
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: settings.text_color }}
          >
            {profile.display_name || profile.username}
          </h1>

          {/* Username */}
          <p
            className="text-sm opacity-75 mb-2"
            style={{ color: settings.text_color }}
          >
            @{profile.username}
          </p>

          {/* Bio */}
          {settings.show_bio && profile.bio && (
            <p
              className="text-sm mb-8 max-w-xs"
              style={{ color: settings.text_color }}
            >
              {profile.bio}
            </p>
          )}

          {/* Links */}
          <div className="w-full space-y-3">
            {links.map((link) => (
              <LinkButton key={link.id} link={link} settings={settings} />
            ))}
          </div>

          {/* Branding */}
          {!canRemoveBranding && (
            <a
              href="/"
              className="mt-12 text-sm opacity-50 hover:opacity-75 transition-opacity"
              style={{ color: settings.text_color }}
            >
              Feito com Links
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
