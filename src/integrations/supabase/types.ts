export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          sort_order?: number
        }
        Relationships: []
      }
      hero: {
        Row: {
          cta1_label: string
          cta1_link: string
          cta2_label: string
          cta2_link: string
          headline: string
          id: number
          stats: Json
          subtext: string
          updated_at: string
        }
        Insert: {
          cta1_label?: string
          cta1_link?: string
          cta2_label?: string
          cta2_link?: string
          headline?: string
          id?: number
          stats?: Json
          subtext?: string
          updated_at?: string
        }
        Update: {
          cta1_label?: string
          cta1_link?: string
          cta2_label?: string
          cta2_link?: string
          headline?: string
          id?: number
          stats?: Json
          subtext?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          subtitle: string
          thumbnail_url: string
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          subtitle?: string
          thumbnail_url?: string
          title?: string
          video_url?: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          subtitle?: string
          thumbnail_url?: string
          title?: string
          video_url?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          id: string
          sort_order: number
          tags: string[]
          title: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          tags?: string[]
          title?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          sort_order?: number
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          copyright_text: string
          cta_heading: string
          cta_subtext: string
          email: string
          footer_text: string
          id: number
          logo_text: string
          nav_items: Json
          popup_duration_sec: number
          popup_heading: string
          popup_interval_sec: number
          popup_link: string
          popup_subtext: string
          social_links: Json
          updated_at: string
          whatsapp: string
        }
        Insert: {
          copyright_text?: string
          cta_heading?: string
          cta_subtext?: string
          email?: string
          footer_text?: string
          id?: number
          logo_text?: string
          nav_items?: Json
          popup_duration_sec?: number
          popup_heading?: string
          popup_interval_sec?: number
          popup_link?: string
          popup_subtext?: string
          social_links?: Json
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          copyright_text?: string
          cta_heading?: string
          cta_subtext?: string
          email?: string
          footer_text?: string
          id?: number
          logo_text?: string
          nav_items?: Json
          popup_duration_sec?: number
          popup_heading?: string
          popup_interval_sec?: number
          popup_link?: string
          popup_subtext?: string
          social_links?: Json
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string
          role: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string
          role?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string
          role?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          must_change_password: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          must_change_password?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          must_change_password?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
