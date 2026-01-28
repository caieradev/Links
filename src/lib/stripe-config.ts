// Stripe configuration - safe to import in client components
// This file contains only types and public data, no Stripe SDK

export type PlanType = 'free' | 'starter' | 'pro'
export type BillingPeriod = 'monthly' | 'yearly'

export interface PricingPlan {
  name: string
  type: PlanType
  monthlyPrice: number
  yearlyPrice: number
  yearlyMonthlyPrice: number
  features: string[]
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    type: 'free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyMonthlyPrice: 0,
    features: [
      'Links ilimitados',
      'Cores personalizadas',
      'Botão compartilhar página',
      'QR Code da página',
      'SEO básico',
    ],
  },
  {
    name: 'Starter',
    type: 'starter',
    monthlyPrice: 19,
    yearlyPrice: 180,
    yearlyMonthlyPrice: 15,
    features: [
      'Tudo do Free +',
      'Temas prontos',
      'Seções de links',
      'Redirect links',
      'Captura de subscribers',
      'Ícones de redes sociais',
      'Imagem de capa nos links',
    ],
  },
  {
    name: 'Pro',
    type: 'pro',
    monthlyPrice: 31,
    yearlyPrice: 300,
    yearlyMonthlyPrice: 25,
    features: [
      'Tudo do Starter +',
      'Remover branding',
      'Analytics detalhado',
      'Gradientes e backgrounds',
      'Fontes e animações',
      'Vídeo do YouTube no header',
      'Lead gate (captura de email)',
      'Domínio customizado',
    ],
  },
]

// Feature flags for each plan
export const PLAN_FEATURES: Record<PlanType, Record<string, boolean | number | null>> = {
  free: {
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
    max_links: null,
  },
  starter: {
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
    can_collect_subscribers: true,
    can_use_link_sections: true,
    can_use_themes: true,
    can_use_redirect_links: true,
    can_use_featured_links: false,
    can_use_link_cover_images: true,
    can_use_social_buttons: true,
    can_use_lead_gate: false,
    can_use_header_video: false,
    max_links: null,
  },
  pro: {
    can_use_custom_colors: true,
    can_use_gradients: true,
    can_use_custom_background_image: true,
    can_use_custom_fonts: true,
    can_use_animations: true,
    can_use_link_thumbnails: true,
    can_use_link_scheduling: true,
    can_view_analytics: true,
    can_use_custom_domain: true,
    can_remove_branding: true,
    can_collect_subscribers: true,
    can_use_link_sections: true,
    can_use_themes: true,
    can_use_redirect_links: true,
    can_use_featured_links: true,
    can_use_link_cover_images: true,
    can_use_social_buttons: true,
    can_use_lead_gate: true,
    can_use_header_video: true,
    max_links: null,
  },
}
