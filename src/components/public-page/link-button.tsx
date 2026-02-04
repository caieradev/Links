'use client'

import { useState, useTransition } from 'react'
import { Share2 } from 'lucide-react'
import { trackLinkClick } from '@/actions/analytics'
import { cn } from '@/lib/utils'
import { detectSocialIcon, getSocialIconSvg } from '@/lib/social-icons'
import { ShareLinkModal } from './share-link-modal'
import { LeadGateModal } from './lead-gate-modal'
import type { Link, PageSettings, FeatureFlags } from '@/types/database'

interface LinkButtonProps {
  link: Link
  settings: PageSettings
  profileName: string
  profileId: string
  flags: FeatureFlags | null
}

export function LinkButton({ link, settings, profileName, profileId, flags }: LinkButtonProps) {
  const [, startTransition] = useTransition()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [leadGateOpen, setLeadGateOpen] = useState(false)

  const canUseLeadGate = flags?.can_use_lead_gate ?? false
  const requiresEmail = link.requires_email && canUseLeadGate

  const handleClick = (e: React.MouseEvent) => {
    // If requires email, show lead gate modal instead of navigating
    if (requiresEmail) {
      e.preventDefault()
      setLeadGateOpen(true)
      return
    }

    // Track click
    startTransition(async () => {
      await trackLinkClick(link.id)
    })
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShareModalOpen(true)
  }

  // Detect social media icon from URL
  const socialInfo = detectSocialIcon(link.url)
  const socialIconSvg = socialInfo ? getSocialIconSvg(socialInfo.icon) : null

  // Determine what icon/image to show
  const hasCoverImage = !!link.cover_image_url
  const hasCustomThumbnail = !!link.thumbnail_url
  const hasSocialIcon = !!socialIconSvg
  const hasIcon = hasCustomThumbnail || hasSocialIcon

  const getLinkStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: settings.link_background_color,
      color: settings.link_text_color,
    }

    if (settings.link_shadow || link.is_featured) {
      baseStyle.boxShadow = link.is_featured
        ? '0 0 0 2px rgba(234, 179, 8, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }

    return baseStyle
  }

  const getLinkClasses = () => {
    const classes = [
      'block w-full font-medium lg:text-lg transition-all duration-200 overflow-hidden',
    ]

    // No padding at top if has cover image
    if (!hasCoverImage) {
      classes.push('p-4 lg:p-5')
    }

    // Center text only if no icon and no cover
    if (!hasIcon && !hasCoverImage) {
      classes.push('text-center')
    }

    switch (settings.link_style) {
      case 'rounded':
        classes.push('rounded-lg')
        break
      case 'pill':
        classes.push(hasCoverImage ? 'rounded-xl' : 'rounded-full')
        break
      case 'square':
        classes.push('rounded-none')
        break
      case 'outline':
        classes.push('rounded-lg bg-transparent border-2')
        break
    }

    switch (settings.link_animation) {
      case 'fade':
        classes.push('hover:opacity-80')
        break
      case 'slide':
        classes.push('hover:translate-y-[-2px]')
        break
      case 'bounce':
        classes.push('hover:scale-[1.02]')
        break
      default:
        classes.push('hover:brightness-95')
    }

    return cn(classes)
  }

  const renderIcon = () => {
    if (hasCustomThumbnail) {
      return (
        <img
          src={link.thumbnail_url!}
          alt=""
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover flex-shrink-0"
        />
      )
    }

    if (hasSocialIcon) {
      return (
        <div
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: settings.text_color + '15' }}
        >
          <div
            className="w-5 h-5 lg:w-6 lg:h-6"
            style={{ color: settings.link_text_color }}
            dangerouslySetInnerHTML={{ __html: socialIconSvg! }}
          />
        </div>
      )
    }

    return null
  }

  const renderContent = () => {
    const shareButton = !requiresEmail ? (
      <button
        onClick={handleShareClick}
        className="p-2 rounded-full hover:bg-black/10 transition-colors flex-shrink-0"
        style={{ color: settings.link_text_color }}
      >
        <Share2 className="h-4 w-4" />
      </button>
    ) : null

    // With cover image - special layout
    if (hasCoverImage) {
      return (
        <>
          <img
            src={link.cover_image_url!}
            alt=""
            className="w-full h-40 lg:h-48 object-cover"
          />
          <div className="p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="block font-semibold truncate">{link.title}</span>
                {link.description && (
                  <span className="block text-sm opacity-75 truncate">{link.description}</span>
                )}
              </div>
              {shareButton}
            </div>
          </div>
        </>
      )
    }

    // With icon/thumbnail
    if (hasIcon) {
      return (
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div className="flex-1 text-left min-w-0">
            <span className="block truncate">{link.title}</span>
            {link.description && (
              <span className="block text-sm opacity-75 truncate">{link.description}</span>
            )}
          </div>
          {shareButton}
        </div>
      )
    }

    // Default - no icon
    return (
      <div className="relative">
        <div className={requiresEmail ? "text-center" : "text-center px-10"}>
          <span className="block">{link.title}</span>
          {link.description && (
            <span className="block text-sm opacity-75 mt-1">{link.description}</span>
          )}
        </div>
        {!requiresEmail && (
          <button
            onClick={handleShareClick}
            className="p-2 rounded-full hover:bg-black/10 transition-colors absolute right-0 top-1/2 -translate-y-1/2"
            style={{ color: settings.link_text_color }}
          >
            <Share2 className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={getLinkClasses()}
        style={getLinkStyle()}
      >
        {renderContent()}
      </a>

      {/* Share Modal */}
      <ShareLinkModal
        link={link}
        settings={settings}
        profileName={profileName}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Lead Gate Modal */}
      {requiresEmail && (
        <LeadGateModal
          link={link}
          settings={settings}
          profileId={profileId}
          isOpen={leadGateOpen}
          onClose={() => setLeadGateOpen(false)}
        />
      )}
    </>
  )
}
