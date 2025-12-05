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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bd_ativo: {
        Row: {
          created_at: string
          id: number
          mensagem: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          mensagem?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          mensagem?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          role_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          role_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          created_at: string | null
          enrollment_fee: number | null
          id: string
          modality_id: string | null
          monthly_fee: number | null
          payment_due_date: number | null
          payment_method: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enrollment_fee?: number | null
          id?: string
          modality_id?: string | null
          monthly_fee?: number | null
          payment_due_date?: number | null
          payment_method?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enrollment_fee?: number | null
          id?: string
          modality_id?: string | null
          monthly_fee?: number | null
          payment_due_date?: number | null
          payment_method?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          registered_at: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          registered_at?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          registered_at?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          date: string
          days_of_week: string[] | null
          description: string | null
          end_time: string
          event_type: string | null
          frequency: string | null
          id: string
          is_inaugural: boolean | null
          location: string
          max_participants: number | null
          modality_id: string | null
          recurring_pattern: Json | null
          start_time: string
          students: string[] | null
          teacher_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date: string
          days_of_week?: string[] | null
          description?: string | null
          end_time: string
          event_type?: string | null
          frequency?: string | null
          id?: string
          is_inaugural?: boolean | null
          location: string
          max_participants?: number | null
          modality_id?: string | null
          recurring_pattern?: Json | null
          start_time: string
          students?: string[] | null
          teacher_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          date?: string
          days_of_week?: string[] | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          frequency?: string | null
          id?: string
          is_inaugural?: boolean | null
          location?: string
          max_participants?: number | null
          modality_id?: string | null
          recurring_pattern?: Json | null
          start_time?: string
          students?: string[] | null
          teacher_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      inaugural_classes: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          notes: string | null
          selected_date: string
          selected_modality_id: string
          selected_time: string | null
          status: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          selected_date: string
          selected_modality_id: string
          selected_time?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          notes?: string | null
          selected_date?: string
          selected_modality_id?: string
          selected_time?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inaugural_classes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inaugural_classes_selected_modality_id_fkey"
            columns: ["selected_modality_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inaugural_classes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          month: string
          paid_date: string | null
          sport: string
          status: string | null
          student_id: string
          student_name: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          month: string
          paid_date?: string | null
          sport: string
          status?: string | null
          student_id: string
          student_name: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          month?: string
          paid_date?: string | null
          sport?: string
          status?: string | null
          student_id?: string
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          registration_flow: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          registration_flow?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          registration_flow?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          ageRange: Json | null
          created_at: string | null
          current_students: number | null
          description: string | null
          id: string
          instructor: string | null
          maxStudents: number
          monthlyFee: number
          name: string
          schedule: Json | null
          status: string | null
          updated_at: string | null
          weeklyHours: number
        }
        Insert: {
          ageRange?: Json | null
          created_at?: string | null
          current_students?: number | null
          description?: string | null
          id?: string
          instructor?: string | null
          maxStudents: number
          monthlyFee: number
          name: string
          schedule?: Json | null
          status?: string | null
          updated_at?: string | null
          weeklyHours: number
        }
        Update: {
          ageRange?: Json | null
          created_at?: string | null
          current_students?: number | null
          description?: string | null
          id?: string
          instructor?: string | null
          maxStudents?: number
          monthlyFee?: number
          name?: string
          schedule?: Json | null
          status?: string | null
          updated_at?: string | null
          weeklyHours?: number
        }
        Relationships: []
      }
      students: {
        Row: {
          address: Json | null
          birthDate: string
          cpf: string
          created_at: string | null
          emergencyContacts: Json[] | null
          enrolledSports: string[] | null
          enrollment_fee: number | null
          enrollmentDate: string
          guardian: Json | null
          healthInfo: Json | null
          id: string
          lastPayment: string | null
          monthlyFee: number | null
          name: string
          payment_due_date: number | null
          paymentStatus: string | null
          photo: string | null
          photo_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          birthDate: string
          cpf: string
          created_at?: string | null
          emergencyContacts?: Json[] | null
          enrolledSports?: string[] | null
          enrollment_fee?: number | null
          enrollmentDate: string
          guardian?: Json | null
          healthInfo?: Json | null
          id?: string
          lastPayment?: string | null
          monthlyFee?: number | null
          name: string
          payment_due_date?: number | null
          paymentStatus?: string | null
          photo?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          birthDate?: string
          cpf?: string
          created_at?: string | null
          emergencyContacts?: Json[] | null
          enrolledSports?: string[] | null
          enrollment_fee?: number | null
          enrollmentDate?: string
          guardian?: Json | null
          healthInfo?: Json | null
          id?: string
          lastPayment?: string | null
          monthlyFee?: number | null
          name?: string
          payment_due_date?: number | null
          paymentStatus?: string | null
          photo?: string | null
          photo_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_sports: {
        Row: {
          created_at: string | null
          id: string
          sport_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sport_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sport_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_sports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_sports_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string
          age: number | null
          cpf: string
          createdAt: string | null
          education: string | null
          email: string
          fullName: string
          gender: string | null
          hireDate: string
          id: string
          identity: string
          modalitiesIds: string[] | null
          nickname: string | null
          phone: string
          salary: number | null
          specialization: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          age?: number | null
          cpf: string
          createdAt?: string | null
          education?: string | null
          email: string
          fullName: string
          gender?: string | null
          hireDate: string
          id?: string
          identity: string
          modalitiesIds?: string[] | null
          nickname?: string | null
          phone: string
          salary?: number | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          age?: number | null
          cpf?: string
          createdAt?: string | null
          education?: string | null
          email?: string
          fullName?: string
          gender?: string | null
          hireDate?: string
          id?: string
          identity?: string
          modalitiesIds?: string[] | null
          nickname?: string | null
          phone?: string
          salary?: number | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_inaugural_events: {
        Args: { student_age: number }
        Returns: {
          available_spots: number
          event_date: string
          event_end_time: string
          event_id: string
          event_start_time: string
          event_title: string
          modality_name: string
          teacher_name: string
        }[]
      }
      register_student_inaugural_event: {
        Args: { p_event_id: string; p_student_id: string }
        Returns: Json
      }
    }
    Enums: {
      event_type_enum:
        | "training"
        | "match"
        | "evaluation"
        | "meeting"
        | "special"
        | "inaugural"
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
      event_type_enum: [
        "training",
        "match",
        "evaluation",
        "meeting",
        "special",
        "inaugural",
      ],
    },
  },
} as const
