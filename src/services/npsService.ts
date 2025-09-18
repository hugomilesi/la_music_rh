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
      console.log('🔄 NPSService: Buscando todas as pesquisas NPS');
      
      const { data, error } = await supabase
        .from('nps_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ NPSService: Erro ao buscar pesquisas:', error);
        throw error;
      }

      console.log(`✅ NPSService: ${data?.length || 0} pesquisas encontradas`);
      return data?.map(this.mapDatabaseSurveyToNPSSurvey) || [];
    } catch (error) {
      console.error('❌ NPSService: Erro ao buscar pesquisas:', error);
      throw error;
    }
  }

  // Buscar todas as respostas
  static async getResponses(): Promise<NPSResponse[]> {
    try {
      console.log('🔄 NPSService: Buscando todas as respostas NPS');
      
      const { data, error } = await supabase
        .from('nps_responses')
        .select(`
          *,
          nps_surveys(title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ NPSService: Erro ao buscar respostas:', error);
        throw error;
      }

      console.log(`✅ NPSService: ${data?.length || 0} respostas encontradas`);
      return data?.map(this.mapDatabaseResponseToNPSResponse) || [];
    } catch (error) {
      console.error('❌ NPSService: Erro ao buscar respostas NPS:', error);
      throw error;
    }
  }

  // Criar nova pesquisa
  static async createSurvey(surveyData: Omit<NPSSurvey, 'id' | 'createdAt' | 'updatedAt'>): Promise<NPSSurvey> {
    try {
      console.log('🔄 NPSService: Criando nova pesquisa:', surveyData);
      
      // Ensure required dates are provided
      const startDate = surveyData.startDate || new Date().toISOString().split('T')[0];
      const endDate = surveyData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
      
      const dbSurvey = {
        title: surveyData.title,
        description: surveyData.description || null,
        survey_type: surveyData.surveyType || 'nps',
        start_date: startDate,
        end_date: endDate,
        status: surveyData.status || 'draft',
        question: surveyData.questions?.[0]?.question || 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa como um lugar para trabalhar?',
        target_departments: surveyData.targetDepartments || [],
        target_employees: surveyData.targetEmployees || [],
        is_anonymous: surveyData.isAnonymous !== undefined ? surveyData.isAnonymous : true
      };

      console.log('📤 NPSService: Dados formatados para o banco:', dbSurvey);

      const { data, error } = await supabase
        .from('nps_surveys')
        .insert([dbSurvey])
        .select()
        .single();

      if (error) {
        console.error('❌ NPSService: Erro do Supabase:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Nenhum dado retornado ao criar pesquisa');
      }

      console.log('✅ NPSService: Pesquisa criada com sucesso:', data.id);
      return this.mapDatabaseSurveyToNPSSurvey(data);
    } catch (error) {
      console.error('❌ NPSService: Erro ao criar pesquisa:', error);
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
      console.log('🔄 NPSService: Gerando token NPS:', { surveyId, userName, userPhone });

      const { data, error } = await supabase
        .rpc('generate_simple_nps_token', {
          p_survey_id: surveyId,
          p_user_name: userName,
          p_user_phone: userPhone,
          p_department: department,
          p_unit: unit
        });

      if (error) {
        console.error('❌ NPSService: Erro ao gerar token:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum token gerado');
      }

      console.log('✅ NPSService: Token gerado com sucesso');
      return data[0];
    } catch (error) {
      console.error('❌ NPSService: Erro ao gerar token NPS:', error);
      throw error;
    }
  }

  // Validar token NPS
  static async validateNPSToken(token: string): Promise<NPSValidationResult> {
    try {
      console.log('🔄 NPSService: Validando token:', token);

      const { data, error } = await supabase
        .rpc('validate_nps_token_simple', {
          p_token: token
        });

      if (error) {
        console.error('❌ NPSService: Erro ao validar token:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          is_valid: false,
          error_message: 'Token não encontrado'
        };
      }

      console.log('✅ NPSService: Token validado');
      return data[0];
    } catch (error) {
      console.error('❌ NPSService: Erro ao validar token:', error);
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
      console.log('🔄 NPSService: Submetendo resposta NPS:', { token, score, comment });

      const { data, error } = await supabase
        .rpc('submit_nps_response', {
          p_token: token,
          p_score: score,
          p_comment: comment
        });

      if (error) {
        console.error('❌ NPSService: Erro ao submeter resposta:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Erro ao processar resposta'
        };
      }

      console.log('✅ NPSService: Resposta submetida com sucesso');
      return data[0];
    } catch (error) {
      console.error('❌ NPSService: Erro ao submeter resposta NPS:', error);
      return {
        success: false,
        message: 'Erro interno ao processar resposta'
      };
    }
  }

  // Obter dados para n8n
  static async getNPSDataForN8N(surveyId: string): Promise<any[]> {
    try {
      console.log('🔄 NPSService: Obtendo dados para n8n:', surveyId);

      const { data, error } = await supabase
        .rpc('get_nps_data_for_n8n', {
          p_survey_id: surveyId
        });

      if (error) {
        console.error('❌ NPSService: Erro ao obter dados para n8n:', error);
        throw error;
      }

      console.log('✅ NPSService: Dados obtidos para n8n:', data?.length || 0, 'registros');
      return data || [];
    } catch (error) {
      console.error('❌ NPSService: Erro ao obter dados para n8n:', error);
      return [];
    }
  }

  // Obter relatório NPS
  static async getNPSReport(
    surveyId?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<NPSReportData[]> {
    try {
      console.log('🔄 NPSService: Obtendo relatório NPS:', { surveyId, startDate, endDate });

      const { data, error } = await supabase
        .rpc('get_nps_report', {
          p_survey_id: surveyId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        });

      if (error) {
        console.error('❌ NPSService: Erro ao obter relatório:', error);
        throw error;
      }

      console.log('✅ NPSService: Relatório obtido com sucesso');
      return data || [];
    } catch (error) {
      console.error('❌ NPSService: Erro ao obter relatório NPS:', error);
      return [];
    }
  }

  // Atualizar pesquisa
  static async updateSurvey(id: string, updates: Partial<NPSSurvey>): Promise<NPSSurvey | null> {
    try {
      const dbUpdates = {
        title: updates.title,
        description: updates.description,
        survey_type: updates.surveyType,
        status: updates.status,
        start_date: updates.startDate,
        end_date: updates.endDate,
        question: updates.questions?.[0]?.question,
        target_departments: updates.targetDepartments,
        target_employees: updates.targetEmployees,
        is_anonymous: updates.isAnonymous,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('nps_surveys')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ NPSService: Erro ao atualizar pesquisa:', error);
        throw error;
      }

      console.log('✅ NPSService: Pesquisa atualizada com sucesso:', id);
      return this.mapDatabaseSurveyToNPSSurvey(data);
    } catch (error) {
      console.error('❌ NPSService: Erro ao atualizar pesquisa:', error);
      return null;
    }
  }

  // Deletar pesquisa
  static async deleteSurvey(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nps_surveys')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ NPSService: Erro ao deletar pesquisa:', error);
        throw error;
      }
      
      console.log('✅ NPSService: Pesquisa deletada com sucesso:', id);
      return true;
    } catch (error) {
      console.error('❌ NPSService: Erro ao deletar pesquisa:', error);
      return false;
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
      console.error('Error calculating NPS stats:', error);
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
      console.error('❌ NPSService: Erro ao obter evolução NPS:', error);
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