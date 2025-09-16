export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      benefit_dependents: {
        Row: {
          birth_date: string | null
          created_at: string | null
          document_number: string | null
          employee_benefit_id: string
          id: string
          is_active: boolean | null
          name: string
          relationship: string
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          document_number?: string | null
          employee_benefit_id: string
          id?: string
          is_active?: boolean | null
          name: string
          relationship: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          document_number?: string | null
          employee_benefit_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_dependents_employee_benefit_id_fkey"
            columns: ["employee_benefit_id"]
            isOneToOne: false
            referencedRelation: "employee_benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_types: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
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
          coverage: Json | null
          created_at: string | null
          descricao: string | null
          eligibility_rules: Json | null
          end_date: string | null
          id: string
          nome: string
          performance_goals: Json | null
          provider: string | null
          renewal_settings: Json | null
          start_date: string | null
          tipo: string | null
          type_id: string | null
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          ativo?: boolean | null
          coverage?: Json | null
          created_at?: string | null
          descricao?: string | null
          eligibility_rules?: Json | null
          end_date?: string | null
          id?: string
          nome: string
          performance_goals?: Json | null
          provider?: string | null
          renewal_settings?: Json | null
          start_date?: string | null
          tipo?: string | null
          type_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          ativo?: boolean | null
          coverage?: Json | null
          created_at?: string | null
          descricao?: string | null
          eligibility_rules?: Json | null
          end_date?: string | null
          id?: string
          nome?: string
          performance_goals?: Json | null
          provider?: string | null
          renewal_settings?: Json | null
          start_date?: string | null
          tipo?: string | null
          type_id?: string | null
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefits_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "benefit_types"
            referencedColumns: ["id"]
          },
        ]
      }
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
      criterion_evaluations: {
        Row: {
          created_at: string
          criterion_id: string
          evaluation_id: string
          id: string
          is_met: boolean
          observation: string | null
          stars_awarded: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterion_id: string
          evaluation_id: string
          id?: string
          is_met?: boolean
          observation?: string | null
          stars_awarded?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterion_id?: string
          evaluation_id?: string
          id?: string
          is_met?: boolean
          observation?: string | null
          stars_awarded?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "criterion_evaluations_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "recognition_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criterion_evaluations_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "employee_evaluations"
            referencedColumns: ["id"]
          },
        ]
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
      employee_achievements: {
        Row: {
          achievement_date: string
          created_at: string
          description: string
          employee_id: string
          id: string
          program_id: string
          stars_awarded: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          achievement_date?: string
          created_at?: string
          description: string
          employee_id: string
          id?: string
          program_id: string
          stars_awarded?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          achievement_date?: string
          created_at?: string
          description?: string
          employee_id?: string
          id?: string
          program_id?: string
          stars_awarded?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_achievements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_achievements_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recognition_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_benefits: {
        Row: {
          benefit_id: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          employee_id: string
          id: string
          is_active: boolean | null
          next_renewal_date: string | null
          observacoes: string | null
          renewal_status: string | null
          updated_at: string | null
          valor_personalizado: number | null
        }
        Insert: {
          benefit_id: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          employee_id: string
          id?: string
          is_active?: boolean | null
          next_renewal_date?: string | null
          observacoes?: string | null
          renewal_status?: string | null
          updated_at?: string | null
          valor_personalizado?: number | null
        }
        Update: {
          benefit_id?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          employee_id?: string
          id?: string
          is_active?: boolean | null
          next_renewal_date?: string | null
          observacoes?: string | null
          renewal_status?: string | null
          updated_at?: string | null
          valor_personalizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_benefits_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "beneficios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_benefits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_evaluations: {
        Row: {
          created_at: string
          employee_id: string
          evaluation_date: string
          evaluation_period: string
          evaluator_id: string
          id: string
          notes: string | null
          program_id: string
          total_stars: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          evaluation_date?: string
          evaluation_period: string
          evaluator_id: string
          id?: string
          notes?: string | null
          program_id: string
          total_stars?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          evaluation_date?: string
          evaluation_period?: string
          evaluator_id?: string
          id?: string
          notes?: string | null
          program_id?: string
          total_stars?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_evaluations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recognition_programs"
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
      folha_pagamento: {
        Row: {
          adiantamento: number | null
          ano: number
          aprovado_em: string | null
          aprovado_por: string | null
          bistro: number | null
          bonus: number | null
          classificacao: string | null
          colaborador_id: string | null
          comissao: number | null
          created_at: string | null
          funcao: string | null
          id: string
          inss: number | null
          lojinha: number | null
          mes: number
          observacoes: string | null
          outros_descontos: number | null
          passagem: number | null
          payroll_id: string | null
          reembolso: number | null
          salario_base: number | null
          salary_advance: number | null
          status: string | null
          transport_voucher: number | null
          updated_at: string | null
        }
        Insert: {
          adiantamento?: number | null
          ano: number
          aprovado_em?: string | null
          aprovado_por?: string | null
          bistro?: number | null
          bonus?: number | null
          classificacao?: string | null
          colaborador_id?: string | null
          comissao?: number | null
          created_at?: string | null
          funcao?: string | null
          id?: string
          inss?: number | null
          lojinha?: number | null
          mes: number
          observacoes?: string | null
          outros_descontos?: number | null
          passagem?: number | null
          payroll_id?: string | null
          reembolso?: number | null
          salario_base?: number | null
          salary_advance?: number | null
          status?: string | null
          transport_voucher?: number | null
          updated_at?: string | null
        }
        Update: {
          adiantamento?: number | null
          ano?: number
          aprovado_em?: string | null
          aprovado_por?: string | null
          bistro?: number | null
          bonus?: number | null
          classificacao?: string | null
          colaborador_id?: string | null
          comissao?: number | null
          created_at?: string | null
          funcao?: string | null
          id?: string
          inss?: number | null
          lojinha?: number | null
          mes?: number
          observacoes?: string | null
          outros_descontos?: number | null
          passagem?: number | null
          payroll_id?: string | null
          reembolso?: number | null
          salario_base?: number | null
          salary_advance?: number | null
          status?: string | null
          transport_voucher?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_aprovado_por_fkey"
            columns: ["aprovado_por"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_pagamento_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payrolls"
            referencedColumns: ["id"]
          },
        ]
      }
      folha_rateio: {
        Row: {
          created_at: string | null
          folha_pagamento_id: string | null
          id: string
          percentual: number | null
          unidade_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          folha_pagamento_id?: string | null
          id?: string
          percentual?: number | null
          unidade_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          folha_pagamento_id?: string | null
          id?: string
          percentual?: number | null
          unidade_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "folha_rateio_folha_pagamento_id_fkey"
            columns: ["folha_pagamento_id"]
            isOneToOne: false
            referencedRelation: "folha_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_rateio_folha_pagamento_id_fkey"
            columns: ["folha_pagamento_id"]
            isOneToOne: false
            referencedRelation: "payroll_full_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_rateio_unidade_id_fkey"
            columns: ["unidade_id"]
            isOneToOne: false
            referencedRelation: "unidades"
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
      monthly_progress: {
        Row: {
          created_at: string
          employee_id: string
          fideliza_stars: number
          id: string
          matriculador_stars: number
          month_year: string
          professor_stars: number
          total_stars: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          fideliza_stars?: number
          id?: string
          matriculador_stars?: number
          month_year: string
          professor_stars?: number
          total_stars?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          fideliza_stars?: number
          id?: string
          matriculador_stars?: number
          month_year?: string
          professor_stars?: number
          total_stars?: number
          updated_at?: string
        }
        Relationships: []
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
      payrolls: {
        Row: {
          created_at: string | null
          id: string
          month: number
          status: string
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          month: number
          status?: string
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          month?: number
          status?: string
          updated_at?: string | null
          year?: number
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
      recognition_criteria: {
        Row: {
          created_at: string
          description: string
          id: string
          is_required: boolean
          max_stars: number | null
          order_index: number
          program_id: string
          title: string
          type: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_required?: boolean
          max_stars?: number | null
          order_index?: number
          program_id: string
          title: string
          type: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_required?: boolean
          max_stars?: number | null
          order_index?: number
          program_id?: string
          title?: string
          type?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "recognition_criteria_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recognition_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      recognition_programs: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          target_roles: string[]
          total_possible_stars: number
          updated_at: string
        }
        Insert: {
          color: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          target_roles?: string[]
          total_possible_stars?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          target_roles?: string[]
          total_possible_stars?: number
          updated_at?: string
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
      unidades: {
        Row: {
          ativa: boolean | null
          codigo: string
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          codigo: string
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          codigo?: string
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
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
      payroll_allocation_summary: {
        Row: {
          colaborador_id: string | null
          collaborator_name: string | null
          folha_pagamento_id: string | null
          unit_allocation_summary: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_rateio_folha_pagamento_id_fkey"
            columns: ["folha_pagamento_id"]
            isOneToOne: false
            referencedRelation: "folha_pagamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folha_rateio_folha_pagamento_id_fkey"
            columns: ["folha_pagamento_id"]
            isOneToOne: false
            referencedRelation: "payroll_full_view"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_full_view: {
        Row: {
          base_salary: number | null
          bistro_expenses: number | null
          bonus: number | null
          classificacao: string | null
          colaborador_id: string | null
          collaborator_email: string | null
          collaborator_name: string | null
          collaborator_phone: string | null
          commission: number | null
          created_at: string | null
          id: string | null
          inss: number | null
          month: number | null
          net_total: number | null
          notes: string | null
          other_discounts: number | null
          payroll_id: string | null
          payroll_status: string | null
          reimbursement: number | null
          role: string | null
          salary_advance: number | null
          status: string | null
          store_expenses: number | null
          total_deductions: number | null
          total_earnings: number | null
          transport_voucher: number | null
          updated_at: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "folha_pagamento_payroll_id_fkey"
            columns: ["payroll_id"]
            isOneToOne: false
            referencedRelation: "payrolls"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_distribute_allocation: {
        Args: { payroll_entry_id: string; target_units: string[] }
        Returns: boolean
      }
      create_admin_user: {
        Args: {
          user_email: string
          user_name: string
          user_role?: string
          user_department?: string
          user_position?: string
          user_phone?: string
        }
        Returns: {
          user_id: string
          generated_password: string
          success: boolean
          message: string
        }[]
      }
      create_employee: {
        Args: {
          emp_name: string
          emp_email: string
          emp_phone: string
          emp_position: string
          emp_department: string
          emp_units?: string[]
          emp_start_date?: string
        }
        Returns: {
          employee_id: string
          success: boolean
          message: string
        }[]
      }
      delete_employee: {
        Args: { emp_id: string }
        Returns: {
          success: boolean
          message: string
        }[]
      }
      generate_random_password: {
        Args: { length?: number }
        Returns: string
      }
      get_avatar_url: {
        Args: { avatar_path: string }
        Returns: string
      }
      get_employee_ranking: {
        Args: { program_filter?: string; evaluation_period_filter?: string }
        Returns: {
          employee_id: string
          employee_name: string
          employee_role: string
          employee_unit: string
          fideliza_stars: number
          matriculador_stars: number
          professor_stars: number
          total_stars: number
          ranking_position: number
        }[]
      }
      update_employee: {
        Args: {
          emp_id: string
          emp_name?: string
          emp_email?: string
          emp_phone?: string
          emp_position?: string
          emp_department?: string
          emp_units?: string[]
          emp_status?: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
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
