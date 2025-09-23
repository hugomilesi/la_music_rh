import { supabase } from '@/integrations/supabase/client';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution } from '@/types/nps';

export interface DatabaseNPSResponse {
  id: string;
  survey_id: string;
  score: number;
  comment?: string;
  category: string;
  department?: string;
  token?: string;
  unit?: string;
  user_name?: string;
  user_phone?: string;
  response_date: string;
  created_at: string;
}

export interface DatabaseNPSSurvey {
  id: string;
  title: string;
  description?: string;
  question: string;
  survey_type: string;
  status: string;
  start_date: string;
  end_date: string;
  target_employees?: string[];
  target_departments?: string[];
  is_anonymous: boolean;
  use_localhost: boolean;
  created_at: string;
  updated_at: string;
}

export interface NPSTokenData {
  token: string;
  nps_url: string;
}

export interface NPSValidationResult {
  is_valid: boolean;
  survey_id?: string;
  user_name?: string;
  user_phone?: string;
  question?: string;
  department?: string;
  unit?: string;
  error_message?: string;
}

export interface NPSSubmissionResult {
  success: boolean;
  message: string;
  response_id?: string;
}

export interface NPSReportData {
  survey_title: string;
  total_responses: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  nps_score: number;
  average_score: number;
}

export class NPSService {
  // Buscar todas as pesquisas
  static async getSurveys(): Promise<NPSSurvey[]> {
    try {
      const { data, error } = await supabase
        .from('nps_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(this.mapDatabaseSurveyToNPSSurvey) || [];
    } catch (error) {
      throw error;
    }
  }

  // Buscar todas as respostas
  static async getResponses(): Promise<NPSResponse[]> {
    try {
      const { data, error } = await supabase
        .from('nps_responses')
        .select(`
          *,
          nps_surveys(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(this.mapDatabaseResponseToNPSResponse) || [];
    } catch (error) {
      throw error;
    }
  }

  // Criar nova pesquisa
  static async createSurvey(surveyData: Omit<NPSSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<NPSSurvey> {
    try {
      // Validate required fields
      if (!surveyData.title || !surveyData.description) {
        throw new Error('Título e descrição são obrigatórios');
      }

      // Prepare data for database insertion
      const dbSurvey = {
        title: surveyData.title,
        description: surveyData.description,
        is_active: surveyData.is_active ?? true,
        start_date: surveyData.start_date || new Date().toISOString(),
        end_date: surveyData.end_date || null,
        target_audience: surveyData.target_audience || 'all',
        created_by: surveyData.created_by
      };

      const { data, error } = await supabase
        .from('nps_surveys')
        .insert([dbSurvey])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado após inserção');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Gerar token NPS para envio
  static async generateNPSToken(
    surveyId: string, 
    userName: string, 
    userPhone: string, 
    department?: string, 
    unit?: string
  ): Promise<NPSTokenData> {
    try {
      const { data, error } = await supabase
        .rpc('generate_simple_nps_token', {
          p_survey_id: surveyId,
          p_user_name: userName,
          p_user_phone: userPhone,
          p_department: department,
          p_unit: unit
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum token gerado');
      }

      return data[0];
    } catch (error) {
      throw error;
    }
  }

  // Validar token NPS
  static async validateNPSToken(token: string): Promise<NPSValidationResult> {
    try {
      const { data, error } = await supabase
        .rpc('validate_nps_token_simple', {
          p_token: token
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          is_valid: false,
          error_message: 'Token não encontrado'
        };
      }

      return data[0];
    } catch (error) {
      return {
        is_valid: false,
        error_message: 'Erro interno ao validar token'
      };
    }
  }

  // Submeter resposta NPS
  static async submitNPSResponse(
    token: string, 
    score: number, 
    comment?: string
  ): Promise<NPSSubmissionResult> {
    try {
      const { data, error } = await supabase
        .rpc('submit_nps_response', {
          p_token: token,
          p_score: score,
          p_comment: comment
        });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Erro ao processar resposta'
        };
      }

      return data[0];
    } catch (error) {
      return {
        success: false,
        message: 'Erro interno ao processar resposta'
      };
    }
  }

  // Obter dados para n8n
  static async getDataForN8n(surveyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nps_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  }

  // Obter relatório NPS
  static async getNPSReport(surveyId?: string, startDate?: string, endDate?: string): Promise<NPSReport> {
    try {
      let query = supabase
        .from('nps_responses')
        .select('*');

      if (surveyId) query = query.eq('survey_id', surveyId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return this.calculateNPSStats(data || []);
    } catch (error) {
      throw error;
    }
  }

  // Atualizar pesquisa
  static async updateSurvey(id: string, updates: Partial<NPSSurvey>): Promise<NPSSurvey> {
    try {
      const { data, error } = await supabase
        .from('nps_surveys')
        .update({
          title: updates.title,
          description: updates.description,
          is_active: updates.is_active,
          start_date: updates.start_date,
          end_date: updates.end_date,
          target_audience: updates.target_audience,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Deletar pesquisa
  static async deleteSurvey(id: string): Promise<void> {
    try {
      // First delete all responses for this survey
      await supabase
        .from('nps_responses')
        .delete()
        .eq('survey_id', id);

      // Then delete the survey
      const { error } = await supabase
        .from('nps_surveys')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  // Calcular estatísticas NPS
  static async calculateNPSStats(): Promise<NPSStats> {
    try {
      const responses = await this.getResponses();
      
      if (responses.length === 0) {
        return {
          currentScore: 0,
          previousScore: 0,
          promoters: 0,
          neutrals: 0,
          detractors: 0,
          totalResponses: 0,
          responseRate: 0,
          satisfied: 0,
          neutralSatisfaction: 0,
          dissatisfied: 0
        };
      }

      // Filtrar respostas válidas
      const npsResponses = responses.filter(r => r.score >= 0 && r.score <= 10);
      
      // Calcular categorias NPS
      const promoters = npsResponses.filter(r => r.score >= 9).length;
      const neutrals = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
      const detractors = npsResponses.filter(r => r.score <= 6).length;

      const npsScore = npsResponses.length > 0 
        ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
        : 0;

      return {
        currentScore: npsScore,
        previousScore: 0, // TODO: Implementar cálculo histórico
        promoters: Math.round((promoters / npsResponses.length) * 100) || 0,
        neutrals: Math.round((neutrals / npsResponses.length) * 100) || 0,
        detractors: Math.round((detractors / npsResponses.length) * 100) || 0,
        totalResponses: responses.length,
        responseRate: 85, // TODO: Calcular baseado em funcionários ativos
        satisfied: Math.round((promoters / npsResponses.length) * 100) || 0,
        neutralSatisfaction: Math.round((neutrals / npsResponses.length) * 100) || 0,
        dissatisfied: Math.round((detractors / npsResponses.length) * 100) || 0
      };
    } catch (error) {
      return {
        currentScore: 0,
        previousScore: 0,
        promoters: 0,
        neutrals: 0,
        detractors: 0,
        totalResponses: 0,
        responseRate: 0,
        satisfied: 0,
        neutralSatisfaction: 0,
        dissatisfied: 0
      };
    }
  }

  // Obter evolução do NPS
  static async getNPSEvolution(): Promise<NPSEvolution[]> {
    try {
      // TODO: Implementar consulta real baseada em dados históricos
      return [];
    } catch (error) {
      return [];
    }
  }

  // Mappers para converter entre formatos do banco e da aplicação
  private static mapDatabaseSurveyToNPSSurvey(dbSurvey: any): NPSSurvey {
    return {
      id: dbSurvey.id,
      title: dbSurvey.title,
      description: dbSurvey.description || '',
      questions: [{
        id: '1',
        type: dbSurvey.survey_type === 'satisfaction' ? 'satisfaction' : 'nps',
        question: dbSurvey.question || 'Como você avaliaria nossa empresa?',
        required: true
      }],
      status: dbSurvey.status as 'draft' | 'active' | 'completed',
      startDate: dbSurvey.start_date,
      endDate: dbSurvey.end_date,
      responses: [],
      targetEmployees: dbSurvey.target_employees || [],
      targetDepartments: dbSurvey.target_departments || [],
      surveyType: dbSurvey.survey_type as 'nps' | 'satisfaction',
      isAnonymous: dbSurvey.is_anonymous,
      createdAt: dbSurvey.created_at,
      updatedAt: dbSurvey.updated_at
    };
  }

  private static mapDatabaseResponseToNPSResponse(dbResponse: any): NPSResponse {
    return {
      id: dbResponse.id,
      employeeId: dbResponse.employee_id || 'anonymous',
      employeeName: dbResponse.user_name || 'Anônimo',
      score: dbResponse.score,
      comment: dbResponse.comment || '',
      date: dbResponse.response_date || dbResponse.created_at.split('T')[0],
      surveyId: dbResponse.survey_id,
      category: NPSService.categorizeResponse(dbResponse.score, 'nps'),
      department: dbResponse.department || 'Não informado'
    };
  }

  private static categorizeResponse(score: number, surveyType: 'nps' | 'satisfaction'): string {
    if (surveyType === 'nps') {
      if (score >= 9) return 'promotor';
      if (score >= 7) return 'neutro';
      return 'detrator';
    } else {
      if (score >= 4) return 'satisfeito';
      if (score >= 3) return 'neutro_satisfacao';
      return 'insatisfeito';
    }
  }
}

// Exportação default para compatibilidade
export default NPSService;