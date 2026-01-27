'use client'

import { useTransition } from 'react'
import { trackLinkClick } from '@/actions/analytics'
import { cn } from '@/lib/utils'
import { detectSocialIcon, getSocialIconSvg } from '@/lib/social-icons'
import type { Link, PageSettings } from '@/types/database'

interface LinkButtonProps {
  link: Link
  settings: PageSettings
}

export function LinkButton({ link, settings }: LinkButtonProps) {
  const [, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await trackLinkClick(link.id)
    })
  }

  // Detect social media icon from URL
  const socialInfo = detectSocialIcon(link.url)
  const socialIconSvg = socialInfo ? getSocialIconSvg(socialInfo.icon) : null

  // Determine what icon/image to show
  const hasCustomThumbnail = !!link.thumbnail_url
  const hasSocialIcon = !!socialIconSvg
  const hasIcon = hasCustomThumbnail || hasSocialIcon

  const getLinkStyle = () => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: settings.link_background_color,
      color: settings.link_text_color,
    }

    if (settings.link_shadow) {
      baseStyle.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }

    return baseStyle
  }

  const getLinkClasses = () => {
    const classes = [
      'block w-full p-4 lg:p-5 font-medium lg:text-lg transition-all duration-200',
    ]

    // Center text only if no icon
    if (!hasIcon) {
      classes.push('text-center')
    }

    switch (settings.link_style) {
      case 'rounded':
        classes.push('rounded-lg')
        break
      case 'pill':
        classes.push('rounded-full')
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
        classes.push('hover:scale-105')
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

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={getLinkClasses()}
      style={getLinkStyle()}
    >
      {hasIcon ? (
        <div className="flex items-center gap-3">
          {renderIcon()}
          <div className="flex-1 text-left min-w-0">
            <span className="block truncate">{link.title}</span>
            {link.description && (
              <span className="block text-sm opacity-75 truncate">{link.description}</span>
            )}
          </div>
        </div>
      ) : (
        <>
          {link.title}
          {link.description && (
            <span className="block text-sm opacity-75 mt-1">{link.description}</span>
          )}
        </>
      )}
    </a>
  )
}
