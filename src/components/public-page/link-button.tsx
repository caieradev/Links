'use client'

import { useTransition } from 'react'
import { trackLinkClick } from '@/actions/analytics'
import { cn } from '@/lib/utils'
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
      'block w-full p-4 text-center font-medium transition-all duration-200',
    ]

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

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={getLinkClasses()}
      style={getLinkStyle()}
    >
      {link.title}
      {link.description && (
        <span className="block text-sm opacity-75 mt-1">{link.description}</span>
      )}
    </a>
  )
}
