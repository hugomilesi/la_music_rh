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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      benefit_dependents: {
        Row: {
          birth_date: string | null
          cpf: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          name: string
          relationship: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          relationship: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          cpf?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          relationship?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      benefit_enrollments: {
        Row: {
          benefit_id: string | null
          created_at: string | null
          dependents: Json | null
          effective_date: string
          employee_contribution: number | null
          employee_id: string | null
          employer_contribution: number | null
          enrollment_date: string
          id: string
          notes: string | null
          status: string | null
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          benefit_id?: string | null
          created_at?: string | null
          dependents?: Json | null
          effective_date: string
          employee_contribution?: number | null
          employee_id?: string | null
          employer_contribution?: number | null
          enrollment_date: string
          id?: string
          notes?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          benefit_id?: string | null
          created_at?: string | null
          dependents?: Json | null
          effective_date?: string
          employee_contribution?: number | null
          employee_id?: string | null
          employer_contribution?: number | null
          enrollment_date?: string
          id?: string
          notes?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_enrollments_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_history: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          enrollment_id: string | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          enrollment_id?: string | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          enrollment_id?: string | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_history_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "benefit_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_types: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      benefits: {
        Row: {
          ativo: boolean | null
          benefit_type_id: string | null
          cost: number | null
          coverage_details: Json | null
          created_at: string | null
          description: string | null
          effective_date: string | null
          eligibility_rules: Json | null
          employee_contribution: number | null
          employer_contribution: number | null
          expiration_date: string | null
          id: string
          is_active: boolean | null
          name: string
          nome: string | null
          provider: string | null
          tipo: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          ativo?: boolean | null
          benefit_type_id?: string | null
          cost?: number | null
          coverage_details?: Json | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          eligibility_rules?: Json | null
          employee_contribution?: number | null
          employer_contribution?: number | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nome?: string | null
          provider?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          ativo?: boolean | null
          benefit_type_id?: string | null
          cost?: number | null
          coverage_details?: Json | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          eligibility_rules?: Json | null
          employee_contribution?: number | null
          employer_contribution?: number | null
          expiration_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nome?: string | null
          provider?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_benefit_type_id_fkey"
            columns: ["benefit_type_id"]
            isOneToOne: false
            referencedRelation: "benefit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      document_acknowledgments: {
        Row: {
          acknowledged_at: string | null
          document_id: string | null
          employee_id: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          document_id?: string | null
          employee_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          document_id?: string | null
          employee_id?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_acknowledgments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_type: string | null
          expires_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          requires_acknowledgment: boolean | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
          version: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          requires_acknowledgment?: boolean | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_type?: string | null
          expires_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          requires_acknowledgment?: boolean | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: string | null
        }
        Relationships: []
      }
      employee_benefits: {
        Row: {
          benefit_id: string | null
          created_at: string | null
          employee_id: string | null
          enrollment_date: string | null
          id: string
          premium_amount: number | null
          status: string | null
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          benefit_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          enrollment_date?: string | null
          id?: string
          premium_amount?: number | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          benefit_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          enrollment_date?: string | null
          id?: string
          premium_amount?: number | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          employee_id: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          employee_id?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: []
      }
      employee_recognitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          employee_id: string | null
          id: string
          nominated_by: string | null
          points_awarded: number | null
          program_id: string | null
          recognition_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          nominated_by?: string | null
          points_awarded?: number | null
          program_id?: string | null
          recognition_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          nominated_by?: string | null
          points_awarded?: number | null
          program_id?: string | null
          recognition_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_recognitions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recognition_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_criteria: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      evaluation_scores: {
        Row: {
          comments: string | null
          created_at: string | null
          criteria_id: string | null
          evaluation_id: string | null
          id: string
          score: number
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          criteria_id?: string | null
          evaluation_id?: string | null
          id?: string
          score: number
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          criteria_id?: string | null
          evaluation_id?: string | null
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "evaluation_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          areas_for_improvement: string | null
          comments: string | null
          competencies_score: number | null
          completed_at: string | null
          confidential: boolean | null
          created_at: string | null
          date: string | null
          development_plan: string | null
          employee_id: string | null
          evaluation_period_end: string | null
          evaluation_period_start: string | null
          evaluator_id: string | null
          final_score: number | null
          goals_score: number | null
          id: string
          overall_rating: string | null
          performance_score: number | null
          review_cycle: string | null
          status: string | null
          strengths: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          areas_for_improvement?: string | null
          comments?: string | null
          competencies_score?: number | null
          completed_at?: string | null
          confidential?: boolean | null
          created_at?: string | null
          date?: string | null
          development_plan?: string | null
          employee_id?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          evaluator_id?: string | null
          final_score?: number | null
          goals_score?: number | null
          id?: string
          overall_rating?: string | null
          performance_score?: number | null
          review_cycle?: string | null
          status?: string | null
          strengths?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          areas_for_improvement?: string | null
          comments?: string | null
          competencies_score?: number | null
          completed_at?: string | null
          confidential?: boolean | null
          created_at?: string | null
          date?: string | null
          development_plan?: string | null
          employee_id?: string | null
          evaluation_period_end?: string | null
          evaluation_period_start?: string | null
          evaluator_id?: string | null
          final_score?: number | null
          goals_score?: number | null
          id?: string
          overall_rating?: string | null
          performance_score?: number | null
          review_cycle?: string | null
          status?: string | null
          strengths?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feedback_360: {
        Row: {
          anonymous: boolean | null
          created_at: string | null
          employee_id: string | null
          feedback: string
          feedback_type: string
          id: string
          reviewer_id: string | null
          reviewer_relationship: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          anonymous?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          feedback: string
          feedback_type: string
          id?: string
          reviewer_id?: string | null
          reviewer_relationship?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          anonymous?: boolean | null
          created_at?: string | null
          employee_id?: string | null
          feedback?: string
          feedback_type?: string
          id?: string
          reviewer_id?: string | null
          reviewer_relationship?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      goal_progress_updates: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          notes: string | null
          progress_percentage: number
          update_date: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          progress_percentage: number
          update_date: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          notes?: string | null
          progress_percentage?: number
          update_date?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_updates_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "performance_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_national: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_national?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_national?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_updates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          incident_id: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          incident_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          incident_id?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string | null
          description: string
          employee_id: string | null
          id: string
          incident_date: string
          reporter_id: string | null
          severity: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          employee_id?: string | null
          id?: string
          incident_date: string
          reporter_id?: string | null
          severity: string
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          employee_id?: string | null
          id?: string
          incident_date?: string
          reporter_id?: string | null
          severity?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      message_schedule_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message_schedule_id: string | null
          recipient_count: number | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_schedule_id?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_schedule_id?: string | null
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_schedule_logs_message_schedule_id_fkey"
            columns: ["message_schedule_id"]
            isOneToOne: false
            referencedRelation: "message_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      message_schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
    
          id: string
          is_active: boolean | null
          last_run: string | null
          message_content: string
          message_type: string | null
          name: string
          next_run: string | null
          target_users: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
    
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          message_content: string
          message_type?: string | null
          name: string
          next_run?: string | null
          target_users?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
    
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          message_content?: string
          message_type?: string | null
          name?: string
          next_run?: string | null
          target_users?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          sms_enabled: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          metadata: Json | null
          recipient_names: string[] | null
          recipients: string[]
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          title: string
          type: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          metadata?: Json | null
          recipient_names?: string[] | null
          recipients: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title: string
          type: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          recipient_names?: string[] | null
          recipients?: string[]
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      nps_analytics: {
        Row: {
          created_at: string | null
          id: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          survey_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          survey_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          survey_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_analytics_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "nps_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_categorized_feedback: {
        Row: {
          category_id: string | null
          created_at: string | null
          feedback_text: string
          id: string
          response_id: string | null
          sentiment_score: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          feedback_text: string
          id?: string
          response_id?: string | null
          sentiment_score?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          feedback_text?: string
          id?: string
          response_id?: string | null
          sentiment_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_categorized_feedback_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "nps_feedback_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_categorized_feedback_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "nps_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_feedback_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          color?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nps_reminders: {
        Row: {
          created_at: string | null
          id: string
          reminder_count: number | null
          sent_at: string | null
          token_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reminder_count?: number | null
          sent_at?: string | null
          token_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reminder_count?: number | null
          sent_at?: string | null
          token_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_reminders_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nps_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_responses: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          response_date: string | null
          score: number
          survey_id: string | null
          token_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          response_date?: string | null
          score: number
          survey_id?: string | null
          token_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          response_date?: string | null
          score?: number
          survey_id?: string | null
          token_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "nps_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_responses_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "nps_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_surveys: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nps_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_used: boolean | null
          survey_id: string | null
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          survey_id?: string | null
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_used?: boolean | null
          survey_id?: string | null
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_tokens_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "nps_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_additions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payroll_entry_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payroll_entry_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payroll_entry_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_additions_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_cycles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          month: number
          status: string | null
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          month: number
          status?: string | null
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          month?: number
          status?: string | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      payroll_deductions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payroll_entry_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payroll_entry_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payroll_entry_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_deductions_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          base_salary: number
          created_at: string | null
          created_by: string | null
          department: string | null
          employee_name: string
          gross_salary: number | null
          id: string
          net_salary: number | null
          payroll_cycle_id: string | null
          position: string | null
          total_additions: number | null
          total_deductions: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          base_salary: number
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employee_name: string
          gross_salary?: number | null
          id?: string
          net_salary?: number | null
          payroll_cycle_id?: string | null
          position?: string | null
          total_additions?: number | null
          total_deductions?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          base_salary?: number
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          employee_name?: string
          gross_salary?: number | null
          id?: string
          net_salary?: number | null
          payroll_cycle_id?: string | null
          position?: string | null
          total_additions?: number | null
          total_deductions?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_payroll_cycle_id_fkey"
            columns: ["payroll_cycle_id"]
            isOneToOne: false
            referencedRelation: "payroll_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_history: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          details: Json | null
          id: string
          payroll_entry_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          payroll_entry_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          payroll_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_history_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_goals: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_progress: number | null
          description: string | null
          due_date: string | null
          employee_id: string | null
          id: string
          priority: string | null
          status: string | null
          target_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_progress?: number | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_progress?: number | null
          description?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recognition_programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          location: string | null
          participants: string[] | null
          schedule_id: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          location?: string | null
          participants?: string[] | null
          schedule_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          location?: string | null
          participants?: string[] | null
          schedule_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_events_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_reminders: {
        Row: {
          created_at: string | null
          event_id: string | null
          id: string
          reminder_time: string
          sent: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          reminder_time: string
          sent?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          id?: string
          reminder_time?: string
          sent?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "schedule_events"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: string | null
          emergency_phone: string | null
          username: string
          hire_date: string | null
          id: string
          is_active: boolean | null
          phone: string | null
          position: string | null
          role: string | null
          salary: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          username: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          position?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          username?: string
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          phone?: string | null
          position?: string | null
          role?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vacation_balances: {
        Row: {
          balance_days: number
          created_at: string | null
          employee_id: string | null
          id: string
          updated_at: string | null
          year: number
        }
        Insert: {
          balance_days: number
          created_at?: string | null
          employee_id?: string | null
          id?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          balance_days?: number
          created_at?: string | null
          employee_id?: string | null
          id?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      vacation_history: {
        Row: {
          action: string
          created_at: string | null
          days_affected: number
          id: string
          performed_by: string | null
          vacation_request_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          days_affected: number
          id?: string
          performed_by?: string | null
          vacation_request_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          days_affected?: number
          id?: string
          performed_by?: string | null
          vacation_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacation_history_vacation_request_id_fkey"
            columns: ["vacation_request_id"]
            isOneToOne: false
            referencedRelation: "vacation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_policies: {
        Row: {
          created_at: string | null
          days_per_year: number
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_per_year: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_per_year?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      vacation_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_requested: number
          employee_id: string | null
          end_date: string
          id: string
          notes: string | null
          reason: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested: number
          employee_id?: string | null
          end_date: string
          id?: string
          notes?: string | null
          reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_requested?: number
          employee_id?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      folha_pagamento: {
        Row: {
          adicional_noturno: number | null
          adicional_periculosidade: number | null
          ano: number
          auxilio_alimentacao: number | null
          auxilio_transporte: number | null
          colaborador_id: string
          comissao: number | null
          created_at: string | null
          desconto_inss: number | null
          desconto_irrf: number | null
          desconto_vale_alimentacao: number | null
          desconto_vale_transporte: number | null
          fgts: number | null
          horas_extras: number | null
          id: string
          mes: number
          outros_descontos: number | null
          outros_proventos: number | null
          salario_base: number | null
          salario_bruto: number | null
          salario_liquido: number | null
          updated_at: string | null
        }
        Insert: {
          adicional_noturno?: number | null
          adicional_periculosidade?: number | null
          ano: number
          auxilio_alimentacao?: number | null
          auxilio_transporte?: number | null
          colaborador_id: string
          comissao?: number | null
          created_at?: string | null
          desconto_inss?: number | null
          desconto_irrf?: number | null
          desconto_vale_alimentacao?: number | null
          desconto_vale_transporte?: number | null
          fgts?: number | null
          horas_extras?: number | null
          id?: string
          mes: number
          outros_descontos?: number | null
          outros_proventos?: number | null
          salario_base?: number | null
          salario_bruto?: number | null
          salario_liquido?: number | null
          updated_at?: string | null
        }
        Update: {
          adicional_noturno?: number | null
          adicional_periculosidade?: number | null
          ano?: number
          auxilio_alimentacao?: number | null
          auxilio_transporte?: number | null
          colaborador_id?: string
          comissao?: number | null
          created_at?: string | null
          desconto_inss?: number | null
          desconto_irrf?: number | null
          desconto_vale_alimentacao?: number | null
          desconto_vale_transporte?: number | null
          fgts?: number | null
          horas_extras?: number | null
          id?: string
          mes?: number
          outros_descontos?: number | null
          outros_proventos?: number | null
          salario_base?: number | null
          salario_bruto?: number | null
          salario_liquido?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_documents_with_employees: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          employee_id: string
          document_name: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          status: string
          expiry_date: string
          notes: string
          uploaded_by: string
          created_at: string
          updated_at: string
          employee_name: string
        }[]
      }
      get_employee_benefits_with_details: {
        Args: {
          employee_id: string
        }
        Returns: {
          id: string
          employee_id: string
          benefit_id: string
          benefit_name: string
          benefit_type: string
          enrollment_date: string
          status: string
          premium_amount: number
          termination_date: string
          created_at: string
          updated_at: string
        }[]
      }
      get_employee_ranking: {
        Args: {
          program_filter?: string
          evaluation_period_filter?: string
        }
        Returns: {
          employee_id: string
          employee_name: string
          employee_unit: string
          employee_role: string
          fideliza_stars: number
          matriculador_stars: number
          professor_stars: number
          total_stars: number
          ranking_position: number
        }[]
      }
      get_payroll_entries_with_details: {
        Args: {
          cycle_id: string
        }
        Returns: {
          id: string
          employee_name: string
          department: string
          position: string
          unit: string
          base_salary: number
          total_additions: number
          total_deductions: number
          gross_salary: number
          net_salary: number
          additions: Json
          deductions: Json
        }[]
      }
      get_schedule_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
