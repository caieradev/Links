import type { FeatureFlags } from '@/types/database'

export const DEFAULT_FEATURE_FLAGS: Omit<FeatureFlags, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  can_use_custom_colors: true,
  can_use_gradients: false,
  can_use_custom_background_image: false,
  can_use_custom_fonts: false,
  can_use_animations: false,
  can_use_link_thumbnails: false,
  can_use_link_scheduling: false,
  can_view_analytics: false,
  can_use_custom_domain: false,
  can_remove_branding: false,
  max_links: 10,
}

export type FeatureFlagKey = keyof Omit<FeatureFlags, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export function hasFeature(flags: FeatureFlags | null, feature: FeatureFlagKey): boolean {
  if (!flags) return DEFAULT_FEATURE_FLAGS[feature] as boolean
  return flags[feature] as boolean
}

export function getMaxLinks(flags: FeatureFlags | null): number {
  if (!flags) return DEFAULT_FEATURE_FLAGS.max_links
  return flags.max_links
}
