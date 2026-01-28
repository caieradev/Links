import { getSocialIconSvg } from '@/lib/social-icons'
import type { SocialLink, PageSettings } from '@/types/database'

interface SocialIconsBarProps {
  socialLinks: SocialLink[]
  settings: PageSettings
}

export function SocialIconsBar({ socialLinks, settings }: SocialIconsBarProps) {
  if (!socialLinks.length) return null

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {socialLinks.map((social) => {
        const iconSvg = getSocialIconSvg(social.platform)

        return (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{
              backgroundColor: `${settings.text_color}15`,
              color: settings.text_color,
            }}
            title={social.platform}
          >
            {iconSvg ? (
              <div
                className="w-5 h-5"
                style={{ color: settings.text_color }}
                dangerouslySetInnerHTML={{ __html: iconSvg }}
              />
            ) : (
              <span className="text-sm font-medium">
                {social.platform.charAt(0).toUpperCase()}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}
