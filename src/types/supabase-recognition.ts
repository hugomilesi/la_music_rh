export interface Database {
  public: {
    Tables: {
      recognition_programs: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          total_possible_stars: number
          target_roles: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          color: string
          icon: string
          total_possible_stars: number
          target_roles: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          total_possible_stars?: number
          target_roles?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recognition_criteria: {
        Row: {
          id: string
          program_id: string
          title: string
          description: string
          type: 'checkbox' | 'stars' | 'observation'
          weight: number
          max_stars: number | null
          is_required: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          program_id: string
          title: string
          description: string
          type: 'checkbox' | 'stars' | 'observation'
          weight: number
          max_stars?: number | null
          is_required?: boolean
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          title?: string
          description?: string
          type?: 'checkbox' | 'stars' | 'observation'
          weight?: number
          max_stars?: number | null
          is_required?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      employee_evaluations: {
        Row: {
          id: string
          employee_id: string
          program_id: string
          evaluation_period: string
          total_stars: number
          evaluator_id: string
          evaluation_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          program_id: string
          evaluation_period: string
          total_stars: number
          evaluator_id: string
          evaluation_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          program_id?: string
          evaluation_period?: string
          total_stars?: number
          evaluator_id?: string
          evaluation_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      criterion_evaluations: {
        Row: {
          id: string
          evaluation_id: string
          criterion_id: string
          is_met: boolean
          stars_awarded: number | null
          observation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          evaluation_id: string
          criterion_id: string
          is_met?: boolean
          stars_awarded?: number | null
          observation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string
          criterion_id?: string
          is_met?: boolean
          stars_awarded?: number | null
          observation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_achievements: {
        Row: {
          id: string
          employee_id: string
          program_id: string
          title: string
          description: string
          stars_awarded: number
          achievement_date: string
          type: 'milestone' | 'bonus' | 'special'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          program_id: string
          title: string
          description: string
          stars_awarded: number
          achievement_date: string
          type: 'milestone' | 'bonus' | 'special'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          program_id?: string
          title?: string
          description?: string
          stars_awarded?: number
          achievement_date?: string
          type?: 'milestone' | 'bonus' | 'special'
          created_at?: string
          updated_at?: string
        }
      }
      monthly_progress: {
        Row: {
          id: string
          employee_id: string
          month_year: string
          fideliza_stars: number
          matriculador_stars: number
          professor_stars: number
          total_stars: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month_year: string
          fideliza_stars?: number
          matriculador_stars?: number
          professor_stars?: number
          total_stars?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month_year?: string
          fideliza_stars?: number
          matriculador_stars?: number
          professor_stars?: number
          total_stars?: number
          created_at?: string
          updated_at?: string
        }
      }
      recognition_bonuses: {
        Row: {
          id: string
          employee_id: string
          program_id: string
          bonus_type: 'monetary' | 'gift' | 'time_off' | 'reconhecimento'
          amount: number | null
          description: string
          awarded_date: string
          status: 'pending' | 'approved' | 'delivered'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          program_id: string
          bonus_type: 'monetary' | 'gift' | 'time_off' | 'reconhecimento'
          amount?: number | null
          description: string
          awarded_date: string
          status?: 'pending' | 'approved' | 'delivered'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          program_id?: string
          bonus_type?: 'monetary' | 'gift' | 'time_off' | 'reconhecimento'
          amount?: number | null
          description?: string
          awarded_date?: string
          status?: 'pending' | 'approved' | 'delivered'
          created_at?: string
          updated_at?: string
        }
      }
      delivered_prizes: {
        Row: {
          id: string
          employee_id: string
          prize_name: string
          prize_description: string
          stars_cost: number
          delivery_date: string
          delivery_status: 'pending' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          prize_name: string
          prize_description: string
          stars_cost: number
          delivery_date: string
          delivery_status?: 'pending' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          prize_name?: string
          prize_description?: string
          stars_cost?: number
          delivery_date?: string
          delivery_status?: 'pending' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
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
      get_employee_recognition_details: {
        Args: {
          employee_id_param: string
        }
        Returns: any
      }
    }
  }
}

export type RecognitionProgram = Database['public']['Tables']['recognition_programs']['Row']
export type RecognitionCriterion = Database['public']['Tables']['recognition_criteria']['Row']
export type EmployeeEvaluation = Database['public']['Tables']['employee_evaluations']['Row']
export type CriterionEvaluation = Database['public']['Tables']['criterion_evaluations']['Row']
export type EmployeeAchievement = Database['public']['Tables']['employee_achievements']['Row']
export type MonthlyProgress = Database['public']['Tables']['monthly_progress']['Row']
export type RecognitionBonus = Database['public']['Tables']['recognition_bonuses']['Row']
export type DeliveredPrize = Database['public']['Tables']['delivered_prizes']['Row']

export interface EmployeeRanking {
  employee_id: string
  employee_name: string
  employee_role: string
  employee_unit: string | null
  fideliza_stars: number
  matriculador_stars: number
  professor_stars: number
  total_stars: number
  ranking_position: number
}