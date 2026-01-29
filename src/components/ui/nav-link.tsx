'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type ComponentProps } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface NavLinkProps extends ComponentProps<typeof Link> {
  activeClassName?: string
  isActive?: boolean
  icon?: React.ComponentType<{ className?: string }>
  showLoadingIcon?: boolean
}

export function NavLink({
  href,
  children,
  className,
  activeClassName,
  isActive,
  icon: Icon,
  showLoadingIcon = true,
  onClick,
  ...props
}: NavLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e)
    }

    if (e.defaultPrevented) return

    e.preventDefault()
    startTransition(() => {
      router.push(href.toString())
    })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        className,
        isActive && activeClassName,
        isPending && 'opacity-70'
      )}
      {...props}
    >
      {isPending && showLoadingIcon ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </Link>
  )
}
