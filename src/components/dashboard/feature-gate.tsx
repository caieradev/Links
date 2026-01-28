'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import type { FeatureFlags } from '@/types/database'
import type { FeatureFlagKey } from '@/lib/feature-flags'
import { hasFeature } from '@/lib/feature-flags'
import { cn } from '@/lib/utils'

interface FeatureGateProps {
  flags: FeatureFlags | null
  feature: FeatureFlagKey
  children: React.ReactNode
  fallback?: React.ReactNode
  /** Title shown when locked (default: "Recurso Premium") */
  lockedTitle?: string
  /** Description shown when locked */
  lockedDescription?: string
  /** If true, wraps locked state in a Card (use for standalone sections) */
  asCard?: boolean
}

export function FeatureGate({
  flags,
  feature,
  children,
  fallback,
  lockedTitle = 'Recurso Premium',
  lockedDescription,
  asCard = false,
}: FeatureGateProps) {
  const isEnabled = hasFeature(flags, feature)

  if (isEnabled) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const lockedContent = (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Lock className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{lockedTitle}</h3>
      {lockedDescription && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {lockedDescription}
        </p>
      )}
      <Button asChild>
        <Link href="/settings">Fazer Upgrade</Link>
      </Button>
    </div>
  )

  if (asCard) {
    return (
      <Card>
        <CardContent>
          {lockedContent}
        </CardContent>
      </Card>
    )
  }

  return lockedContent
}

interface FeatureGateWrapperProps {
  flags: FeatureFlags | null
  feature: FeatureFlagKey
  className?: string
  children: React.ReactNode
}

export function FeatureGateWrapper({ flags, feature, className, children }: FeatureGateWrapperProps) {
  const isEnabled = hasFeature(flags, feature)

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Recurso Premium</h3>
        <Button asChild>
          <Link href="/settings">Fazer Upgrade</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}
