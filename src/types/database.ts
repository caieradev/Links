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
          position: number
          is_active: boolean
          click_count: number
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
          position: number
          is_active?: boolean
          click_count?: number
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
          position?: number
          is_active?: boolean
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
          max_links: number
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
          max_links?: number
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
          max_links?: number
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
