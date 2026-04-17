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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          id: string
          name: string
          points: number | null
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points?: number | null
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          date: string
          duration_hours: number
          guide_id: string
          id: string
          language: string | null
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_hours?: number
          guide_id: string
          id?: string
          language?: string | null
          notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_hours?: number
          guide_id?: string
          id?: string
          language?: string | null
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          state: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          state?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      guides: {
        Row: {
          available: boolean | null
          avatar_url: string | null
          bio: string | null
          city_id: string | null
          created_at: string
          hourly_rate: number | null
          id: string
          languages: string[]
          name: string
          rating: number | null
          specialties: string[]
          verified: boolean | null
        }
        Insert: {
          available?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city_id?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          languages?: string[]
          name: string
          rating?: number | null
          specialties?: string[]
          verified?: boolean | null
        }
        Update: {
          available?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          city_id?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          languages?: string[]
          name?: string
          rating?: number | null
          specialties?: string[]
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guides_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      price_reports: {
        Row: {
          city_id: string | null
          created_at: string
          expected_price: number | null
          id: string
          item: string
          notes: string | null
          reported_price: number
          user_id: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          expected_price?: number | null
          id?: string
          item: string
          notes?: string | null
          reported_price: number
          user_id?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string
          expected_price?: number | null
          id?: string
          item?: string
          notes?: string | null
          reported_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          category: string
          city_id: string
          created_at: string
          currency: string | null
          id: string
          item: string
          local_price: number
          official_price: number | null
          report_count: number | null
          tourist_price: number
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          category: string
          city_id: string
          created_at?: string
          currency?: string | null
          id?: string
          item: string
          local_price: number
          official_price?: number | null
          report_count?: number | null
          tourist_price: number
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          city_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          item?: string
          local_price?: number
          official_price?: number | null
          report_count?: number | null
          tourist_price?: number
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          language: string | null
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string | null
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scam_reports: {
        Row: {
          ai_summary: string | null
          city_id: string | null
          created_at: string
          description: string
          id: string
          legal_sections: Json | null
          media_url: string | null
          recommended_actions: Json | null
          scam_score: number | null
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          city_id?: string | null
          created_at?: string
          description: string
          id?: string
          legal_sections?: Json | null
          media_url?: string | null
          recommended_actions?: Json | null
          scam_score?: number | null
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          city_id?: string | null
          created_at?: string
          description?: string
          id?: string
          legal_sections?: Json | null
          media_url?: string | null
          recommended_actions?: Json | null
          scam_score?: number | null
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scam_reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      scam_zones: {
        Row: {
          city_id: string | null
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          name: string
          radius_m: number | null
          risk_level: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          name: string
          radius_m?: number | null
          risk_level?: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          name?: string
          radius_m?: number | null
          risk_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "scam_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
