import type { FeatureFlags } from '@/types/database'

export const DEFAULT_FEATURE_FLAGS: Omit<FeatureFlags, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  can_use_custom_colors: true,
  can_use_gradients: false,
  can_use_custom_background_image: false,
  can_use_custom_fonts: false,
  can_use_animations: false,
  can_use_link_thumbnails: true,
  can_use_link_scheduling: false,
  can_view_analytics: false,
  can_use_custom_domain: false,
  can_remove_branding: false,
  can_collect_subscribers: false,
  can_use_link_sections: false,
  can_use_themes: false,
  can_use_redirect_links: false,
  can_use_featured_links: false,
  can_use_link_cover_images: false,
  can_use_social_buttons: false,
  can_use_lead_gate: false,
  can_use_header_video: false,
  max_links: null, // unlimited for free tier
}

export type FeatureFlagKey = keyof Omit<FeatureFlags, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export function hasFeature(flags: FeatureFlags | null, feature: FeatureFlagKey): boolean {
  if (!flags) return DEFAULT_FEATURE_FLAGS[feature] as boolean
  return flags[feature] as boolean
}

export function getMaxLinks(flags: FeatureFlags | null): number | null {
  if (!flags) return DEFAULT_FEATURE_FLAGS.max_links
  return flags.max_links
}
