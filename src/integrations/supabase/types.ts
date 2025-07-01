export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      content_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          notes: string | null
          status: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar: string | null
          created_at: string
          department: string
          email: string
          id: string
          name: string
          phone: string
          position: string
          start_date: string
          status: string
          units: string[]
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          department: string
          email: string
          id?: string
          name: string
          phone: string
          position: string
          start_date: string
          status?: string
          units?: string[]
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          department?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          position?: string
          start_date?: string
          status?: string
          units?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          comments: string | null
          confidential: boolean | null
          created_at: string | null
          date: string
          employee_id: string
          evaluator_id: string | null
          follow_up_actions: string | null
          id: string
          location: string | null
          meeting_date: string | null
          meeting_time: string | null
          period: string
          score: number | null
          status: string
          topics: string[] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          confidential?: boolean | null
          created_at?: string | null
          date?: string
          employee_id: string
          evaluator_id?: string | null
          follow_up_actions?: string | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          period: string
          score?: number | null
          status?: string
          topics?: string[] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          confidential?: boolean | null
          created_at?: string | null
          date?: string
          employee_id?: string
          evaluator_id?: string | null
          follow_up_actions?: string | null
          id?: string
          location?: string | null
          meeting_date?: string | null
          meeting_time?: string | null
          period?: string
          score?: number | null
          status?: string
          topics?: string[] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          description: string
          employee_id: string
          id: number
          incident_date: string
          reporter_id: string | null
          severity: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          employee_id: string
          id?: number
          incident_date: string
          reporter_id?: string | null
          severity: string
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          employee_id?: string
          id?: number
          incident_date?: string
          reporter_id?: string | null
          severity?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string | null
          created_by: string
          id: string
          message: string
          metadata: Json | null
          recipient_names: string[]
          recipients: string[]
          scheduled_for: string | null
          sent_at: string | null
          status: string
          template_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          created_by: string
          id?: string
          message: string
          metadata?: Json | null
          recipient_names: string[]
          recipients: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          created_by?: string
          id?: string
          message?: string
          metadata?: Json | null
          recipient_names?: string[]
          recipients?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nps_responses: {
        Row: {
          category: string
          comment: string | null
          created_at: string | null
          department: string | null
          employee_id: string
          id: string
          response_date: string
          score: number
          survey_id: string
        }
        Insert: {
          category: string
          comment?: string | null
          created_at?: string | null
          department?: string | null
          employee_id: string
          id?: string
          response_date?: string
          score: number
          survey_id: string
        }
        Update: {
          category?: string
          comment?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string
          id?: string
          response_date?: string
          score?: number
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "nps_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_surveys: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          survey_type: string
          target_departments: string[] | null
          target_employees: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          start_date: string
          status?: string
          survey_type?: string
          target_departments?: string[] | null
          target_employees?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          survey_type?: string
          target_departments?: string[] | null
          target_employees?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          department: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          preferences: Json | null
          role: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          created_at: string | null
          description: string | null
          email_alert: boolean | null
          employee_id: string
          end_time: string
          event_date: string
          id: string
          location: string | null
          start_time: string
          title: string
          type: string
          unit: string
          updated_at: string | null
          whatsapp_alert: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email_alert?: boolean | null
          employee_id: string
          end_time: string
          event_date: string
          id?: string
          location?: string | null
          start_time: string
          title: string
          type: string
          unit: string
          updated_at?: string | null
          whatsapp_alert?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email_alert?: boolean | null
          employee_id?: string
          end_time?: string
          event_date?: string
          id?: string
          location?: string | null
          start_time?: string
          title?: string
          type?: string
          unit?: string
          updated_at?: string | null
          whatsapp_alert?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_balances: {
        Row: {
          created_at: string | null
          employee_id: string
          expiration_date: string
          id: string
          remaining_days: number
          total_days: number
          updated_at: string | null
          used_days: number
          yearly_allowance: number
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          expiration_date?: string
          id?: string
          remaining_days?: number
          total_days?: number
          updated_at?: string | null
          used_days?: number
          yearly_allowance?: number
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          expiration_date?: string
          id?: string
          remaining_days?: number
          total_days?: number
          updated_at?: string | null
          used_days?: number
          yearly_allowance?: number
        }
        Relationships: [
          {
            foreignKeyName: "vacation_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_requests: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          days: number
          employee_id: string
          end_date: string
          id: string
          reason: string
          rejection_reason: string | null
          request_date: string
          start_date: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          days: number
          employee_id: string
          end_date: string
          id?: string
          reason: string
          rejection_reason?: string | null
          request_date?: string
          start_date: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string
          rejection_reason?: string | null
          request_date?: string
          start_date?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacation_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_avatar_url: {
        Args: { avatar_path: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
