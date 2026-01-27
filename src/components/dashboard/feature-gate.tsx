'use client'

import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'
import type { FeatureFlags } from '@/types/database'
import type { FeatureFlagKey } from '@/lib/feature-flags'
import { hasFeature } from '@/lib/feature-flags'
import { cn } from '@/lib/utils'

interface FeatureGateProps {
  flags: FeatureFlags | null
  feature: FeatureFlagKey
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ flags, feature, children, fallback }: FeatureGateProps) {
  const isEnabled = hasFeature(flags, feature)

  if (isEnabled) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          Pro
        </Badge>
      </div>
    </div>
  )
}

interface FeatureGateWrapperProps {
  flags: FeatureFlags | null
  feature: FeatureFlagKey
  className?: string
  children: React.ReactNode
}

export function FeatureGateWrapper({ flags, feature, className, children }: FeatureGateWrapperProps) {
  const isEnabled = hasFeature(flags, feature)

  return (
    <div className={cn(!isEnabled && 'opacity-50 pointer-events-none', className)}>
      {children}
      {!isEnabled && (
        <Badge variant="secondary" className="gap-1 ml-2">
          <Lock className="h-3 w-3" />
          Pro
        </Badge>
      )}
    </div>
  )
}
