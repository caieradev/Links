export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      links: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string
          description: string | null
          icon: string | null
          thumbnail_url: string | null
          cover_image_url: string | null
          position: number
          is_active: boolean
          is_featured: boolean
          requires_email: boolean
          click_count: number
          section_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url: string
          description?: string | null
          icon?: string | null
          thumbnail_url?: string | null
          cover_image_url?: string | null
          position: number
          is_active?: boolean
          is_featured?: boolean
          requires_email?: boolean
          click_count?: number
          section_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string
          description?: string | null
          icon?: string | null
          thumbnail_url?: string | null
          cover_image_url?: string | null
          position?: number
          is_active?: boolean
          is_featured?: boolean
          requires_email?: boolean
          click_count?: number
          section_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "links_section_id_fkey"
            columns: ["section_id"]
            referencedRelation: "link_sections"
            referencedColumns: ["id"]
          }
        ]
      }
      page_settings: {
        Row: {
          id: string
          user_id: string
          background_type: string
          background_color: string
          background_gradient_start: string | null
          background_gradient_end: string | null
          background_gradient_direction: string
          background_image_url: string | null
          background_blur: number
          text_color: string
          link_background_color: string
          link_text_color: string
          link_hover_color: string
          font_family: string
          link_style: string
          link_shadow: boolean
          show_avatar: boolean
          show_bio: boolean
          avatar_size: string
          link_animation: string
          subscriber_form_enabled: boolean
          subscriber_form_title: string
          subscriber_form_description: string | null
          redirect_url: string | null
          redirect_until: string | null
          header_video_url: string | null
          social_icons_position: string
          hide_branding: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          background_type?: string
          background_color?: string
          background_gradient_start?: string | null
          background_gradient_end?: string | null
          background_gradient_direction?: string
          background_image_url?: string | null
          background_blur?: number
          text_color?: string
          link_background_color?: string
          link_text_color?: string
          link_hover_color?: string
          font_family?: string
          link_style?: string
          link_shadow?: boolean
          show_avatar?: boolean
          show_bio?: boolean
          avatar_size?: string
          link_animation?: string
          subscriber_form_enabled?: boolean
          subscriber_form_title?: string
          subscriber_form_description?: string | null
          redirect_url?: string | null
          redirect_until?: string | null
          header_video_url?: string | null
          social_icons_position?: string
          hide_branding?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          background_type?: string
          background_color?: string
          background_gradient_start?: string | null
          background_gradient_end?: string | null
          background_gradient_direction?: string
          background_image_url?: string | null
          background_blur?: number
          text_color?: string
          link_background_color?: string
          link_text_color?: string
          link_hover_color?: string
          font_family?: string
          link_style?: string
          link_shadow?: boolean
          show_avatar?: boolean
          show_bio?: boolean
          avatar_size?: string
          link_animation?: string
          subscriber_form_enabled?: boolean
          subscriber_form_title?: string
          subscriber_form_description?: string | null
          redirect_url?: string | null
          redirect_until?: string | null
          header_video_url?: string | null
          social_icons_position?: string
          hide_branding?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      feature_flags: {
        Row: {
          id: string
          user_id: string
          can_use_custom_colors: boolean
          can_use_gradients: boolean
          can_use_custom_background_image: boolean
          can_use_custom_fonts: boolean
          can_use_animations: boolean
          can_use_link_thumbnails: boolean
          can_use_link_scheduling: boolean
          can_view_analytics: boolean
          can_use_custom_domain: boolean
          can_remove_branding: boolean
          can_collect_subscribers: boolean
          can_use_link_sections: boolean
          can_use_themes: boolean
          can_use_redirect_links: boolean
          can_use_featured_links: boolean
          can_use_link_cover_images: boolean
          can_use_social_buttons: boolean
          can_use_lead_gate: boolean
          can_use_header_video: boolean
          max_links: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          can_use_custom_colors?: boolean
          can_use_gradients?: boolean
          can_use_custom_background_image?: boolean
          can_use_custom_fonts?: boolean
          can_use_animations?: boolean
          can_use_link_thumbnails?: boolean
          can_use_link_scheduling?: boolean
          can_view_analytics?: boolean
          can_use_custom_domain?: boolean
          can_remove_branding?: boolean
          can_collect_subscribers?: boolean
          can_use_link_sections?: boolean
          can_use_themes?: boolean
          can_use_redirect_links?: boolean
          can_use_featured_links?: boolean
          can_use_link_cover_images?: boolean
          can_use_social_buttons?: boolean
          can_use_lead_gate?: boolean
          can_use_header_video?: boolean
          max_links?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          can_use_custom_colors?: boolean
          can_use_gradients?: boolean
          can_use_custom_background_image?: boolean
          can_use_custom_fonts?: boolean
          can_use_animations?: boolean
          can_use_link_thumbnails?: boolean
          can_use_link_scheduling?: boolean
          can_view_analytics?: boolean
          can_use_custom_domain?: boolean
          can_remove_branding?: boolean
          can_collect_subscribers?: boolean
          can_use_link_sections?: boolean
          can_use_themes?: boolean
          can_use_redirect_links?: boolean
          can_use_featured_links?: boolean
          can_use_link_cover_images?: boolean
          can_use_social_buttons?: boolean
          can_use_lead_gate?: boolean
          can_use_header_video?: boolean
          max_links?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      custom_domains: {
        Row: {
          id: string
          user_id: string
          domain: string
          is_verified: boolean
          verification_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          is_verified?: boolean
          verification_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          is_verified?: boolean
          verification_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscribers: {
        Row: {
          id: string
          profile_id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      link_sections: {
        Row: {
          id: string
          profile_id: string
          title: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_sections_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      social_links: {
        Row: {
          id: string
          profile_id: string
          platform: string
          url: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          platform: string
          url: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          platform?: string
          url?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          profile_id: string
          link_id: string | null
          event_type: string
          referrer: string | null
          user_agent: string | null
          country: string | null
          city: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          link_id?: string | null
          event_type: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          link_id?: string | null
          event_type?: string
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
          city?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_link_id_fkey"
            columns: ["link_id"]
            referencedRelation: "links"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan_type: string
          status: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_link_click: {
        Args: { link_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Link = Database['public']['Tables']['links']['Row']
export type PageSettings = Database['public']['Tables']['page_settings']['Row']
export type FeatureFlags = Database['public']['Tables']['feature_flags']['Row']
export type CustomDomain = Database['public']['Tables']['custom_domains']['Row']
export type Subscriber = Database['public']['Tables']['subscribers']['Row']
export type LinkSection = Database['public']['Tables']['link_sections']['Row']
export type SocialLink = Database['public']['Tables']['social_links']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  plan_type: 'free' | 'starter' | 'pro'
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}
