import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LinkButton } from './link-button'
import { PageTracker } from './page-tracker'
import { SharePageButton } from './share-page-button'
import { SubscriberBellModal } from './subscriber-bell-modal'
import { SocialIconsBar } from './social-icons-bar'
import { YouTubeHeader } from './youtube-header'
import { JoinCTA } from './join-cta'
import { DesktopQRCode } from './desktop-qr-code'
import type { Profile, Link, PageSettings, FeatureFlags, LinkSection, SocialLink } from '@/types/database'
import { cn } from '@/lib/utils'

interface PublicPageProps {
  profile: Profile
  links: Link[]
  settings: PageSettings
  flags: FeatureFlags | null
  sections?: LinkSection[]
  socialLinks?: SocialLink[]
  pageUrl: string
}

export function PublicPage({ profile, links, settings, flags, sections = [], socialLinks = [], pageUrl }: PublicPageProps) {
  const canRemoveBranding = flags?.can_remove_branding ?? false
  const canCollectSubscribers = flags?.can_collect_subscribers ?? false
  const canUseSocialButtons = flags?.can_use_social_buttons ?? false
  const canUseHeaderVideo = flags?.can_use_header_video ?? false

  const showSubscriberBell = canCollectSubscribers && settings.subscriber_form_enabled
  const showSocialIcons = canUseSocialButtons && socialLinks.length > 0 && settings.social_icons_position !== 'hidden'
  const showYouTubeHeader = canUseHeaderVideo && settings.header_video_url

  // Group links by section
  const linksWithoutSection = links.filter((link) => !link.section_id)
  const sectionedLinks = sections.map((section) => ({
    section,
    links: links.filter((link) => link.section_id === section.id),
  })).filter((group) => group.links.length > 0)

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
        return 'h-16 w-16 lg:h-20 lg:w-20'
      case 'large':
        return 'h-32 w-32 lg:h-40 lg:w-40'
      default:
        return 'h-24 w-24 lg:h-32 lg:w-32'
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

  const profileName = profile.display_name || profile.username

  return (
    <div
      className="min-h-screen relative"
      style={{
        ...getBackgroundStyle(),
        fontFamily: getFontFamily(),
      }}
    >
      {/* Page view tracker */}
      <PageTracker profileId={profile.id} />

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

      {/* Header Actions */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {showSubscriberBell && (
          <SubscriberBellModal profileId={profile.id} settings={settings} />
        )}
        <SharePageButton url={pageUrl} title={profileName} settings={settings} />
      </div>

      <div className="relative z-10 container max-w-md lg:max-w-lg mx-auto px-4 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center">
          {/* YouTube Header Video */}
          {showYouTubeHeader && (
            <YouTubeHeader videoUrl={settings.header_video_url!} />
          )}

          {/* Avatar */}
          {settings.show_avatar && (
            <Avatar className={cn(getAvatarSize(), 'mb-4 border-4 border-white/20')}>
              <AvatarImage src={profile.avatar_url || undefined} alt={profileName} />
              <AvatarFallback
                className="text-2xl"
                style={{ backgroundColor: settings.link_background_color, color: settings.link_text_color }}
              >
                {profileName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Display Name */}
          <h1
            className="text-2xl lg:text-3xl font-bold mb-1"
            style={{ color: settings.text_color }}
          >
            {profileName}
          </h1>

          {/* Username */}
          <p
            className="text-sm lg:text-base opacity-75 mb-2"
            style={{ color: settings.text_color }}
          >
            @{profile.username}
          </p>

          {/* Bio */}
          {settings.show_bio && profile.bio && (
            <p
              className="text-sm lg:text-base mb-6 max-w-xs lg:max-w-sm break-words whitespace-pre-wrap"
              style={{ color: settings.text_color }}
            >
              {profile.bio}
            </p>
          )}

          {/* Social Icons - Above */}
          {showSocialIcons && settings.social_icons_position === 'above' && (
            <div className="mb-6">
              <SocialIconsBar socialLinks={socialLinks} settings={settings} />
            </div>
          )}

          {/* Links */}
          <div className="w-full space-y-3">
            {/* Links without section */}
            {linksWithoutSection.map((link) => (
              <LinkButton
                key={link.id}
                link={link}
                settings={settings}
                profileName={profileName}
                profileId={profile.id}
                flags={flags}
              />
            ))}

            {/* Sectioned links */}
            {sectionedLinks.map(({ section, links: sectionLinks }) => (
              <div key={section.id} className="w-full space-y-3">
                <h3
                  className="text-sm font-medium opacity-75 mt-6 mb-2"
                  style={{ color: settings.text_color }}
                >
                  {section.title}
                </h3>
                {sectionLinks.map((link) => (
                  <LinkButton
                    key={link.id}
                    link={link}
                    settings={settings}
                    profileName={profileName}
                    profileId={profile.id}
                    flags={flags}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Social Icons - Below */}
          {showSocialIcons && settings.social_icons_position === 'below' && (
            <div className="mt-8">
              <SocialIconsBar socialLinks={socialLinks} settings={settings} />
            </div>
          )}

          {/* Branding / Join CTA */}
          {!canRemoveBranding && (
            <JoinCTA profileName={profileName} settings={settings} />
          )}
        </div>
      </div>

      {/* Desktop QR Code */}
      <DesktopQRCode url={pageUrl} settings={settings} />
    </div>
  )
}
