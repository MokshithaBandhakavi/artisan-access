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
      applications: {
        Row: {
          created_at: string
          id: string
          job_id: string
          match_score: number
          note: string | null
          stage: Database["public"]["Enums"]["pipeline_stage"]
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          match_score?: number
          note?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          note?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          id: string
          issuer: string | null
          name: string
          verified: boolean
          worker_id: string
          year: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          issuer?: string | null
          name: string
          verified?: boolean
          worker_id: string
          year?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          issuer?: string | null
          name?: string
          verified?: boolean
          worker_id?: string
          year?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          about: string | null
          city: string | null
          created_at: string
          id: string
          industry: string | null
          name: string
          owner_id: string
          verified: boolean
        }
        Insert: {
          about?: string | null
          city?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          owner_id: string
          verified?: boolean
        }
        Update: {
          about?: string | null
          city?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      jobs: {
        Row: {
          city: string
          company_id: string | null
          created_at: string
          description: string | null
          employment_type: string
          id: string
          openings: number
          posted_by: string
          skills: string[]
          status: string
          title: string
          trade: string
          updated_at: string
          wage: number | null
          wage_period: string
        }
        Insert: {
          city?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string
          id?: string
          openings?: number
          posted_by: string
          skills?: string[]
          status?: string
          title: string
          trade?: string
          updated_at?: string
          wage?: number | null
          wage_period?: string
        }
        Update: {
          city?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string
          id?: string
          openings?: number
          posted_by?: string
          skills?: string[]
          status?: string
          title?: string
          trade?: string
          updated_at?: string
          wage?: number | null
          wage_period?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_history: {
        Row: {
          created_at: string
          employer_name: string
          from_year: number | null
          id: string
          role: string
          to_year: number | null
          verified: boolean
          worker_id: string
        }
        Insert: {
          created_at?: string
          employer_name: string
          from_year?: number | null
          id?: string
          role: string
          to_year?: number | null
          verified?: boolean
          worker_id: string
        }
        Update: {
          created_at?: string
          employer_name?: string
          from_year?: number | null
          id?: string
          role?: string
          to_year?: number | null
          verified?: boolean
          worker_id?: string
        }
        Relationships: []
      }
      worker_profiles: {
        Row: {
          available: boolean
          bio: string | null
          created_at: string
          expected_wage: number | null
          experience_years: number
          id_verified: boolean
          languages: string[]
          rating: number
          reference_verified: boolean
          skill_verified: boolean
          skills: string[]
          trade: string
          updated_at: string
          user_id: string
          wage_period: string
        }
        Insert: {
          available?: boolean
          bio?: string | null
          created_at?: string
          expected_wage?: number | null
          experience_years?: number
          id_verified?: boolean
          languages?: string[]
          rating?: number
          reference_verified?: boolean
          skill_verified?: boolean
          skills?: string[]
          trade?: string
          updated_at?: string
          user_id: string
          wage_period?: string
        }
        Update: {
          available?: boolean
          bio?: string | null
          created_at?: string
          expected_wage?: number | null
          experience_years?: number
          id_verified?: boolean
          languages?: string[]
          rating?: number
          reference_verified?: boolean
          skill_verified?: boolean
          skills?: string[]
          trade?: string
          updated_at?: string
          user_id?: string
          wage_period?: string
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
      app_role: "worker" | "employer" | "admin"
      pipeline_stage:
        | "applied"
        | "shortlisted"
        | "interview"
        | "hired"
        | "rejected"
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
    Enums: {
      app_role: ["worker", "employer", "admin"],
      pipeline_stage: [
        "applied",
        "shortlisted",
        "interview",
        "hired",
        "rejected",
      ],
    },
  },
} as const
