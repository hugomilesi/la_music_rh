import { supabase } from '@/integrations/supabase/client';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution } from '@/types/nps';

export interface DatabaseNPSResponse {
  id: string;
  survey_id: string;
  respondente_id: string;
  pontuacao: number;
  comentario?: string;
  created_at: string;
  updated_at: string;
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
  auto_send: boolean;
  frequency_days: number;
  last_sent_at?: string;
  next_send_date?: string;
  created_at: string;
  updated_at: string;
}

export interface NPSAutomationConfig {
  id: string;
  survey_id: string;
  is_active: boolean;
  frequency_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  frequency_value: number;
  send_time: string;
  target_day_of_week?: number;
  target_day_of_month?: number;
  last_execution_date?: string;
  next_execution_date?: string;
  created_at: string;
  updated_at: string;
}

export class NPSService {
  // Buscar todas as pesquisas
  static async getSurveys(): Promise<NPSSurvey[]> {
    try {
      const { data, error } = await supabase
        .from('nps_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseSurveyToNPSSurvey);
    } catch (error) {
      // Log desabilitado: Error fetching surveys
      return [];
    }
  }

  // Buscar todas as respostas
  static async getResponses(): Promise<NPSResponse[]> {
    try {
      const { data, error } = await supabase
        .from('nps_responses')
        .select(`
          *,
          nps_surveys(title),
          users(full_name, department)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseResponseToNPSResponse);
    } catch (error) {
      // Log desabilitado: Error fetching responses
      return [];
    }
  }

  // Criar nova pesquisa
  static async createSurvey(survey: Omit<NPSSurvey, 'id'>): Promise<NPSSurvey | null> {
    try {
      const dbSurvey = this.mapNPSSurveyToDatabaseSurvey(survey);
      
      const { data, error } = await supabase
        .from('nps_surveys')
        .insert([dbSurvey])
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseSurveyToNPSSurvey(data);
    } catch (error) {
    throw error;
  }
  }

  // Atualizar pesquisa
  static async updateSurvey(id: string, updates: Partial<NPSSurvey>): Promise<NPSSurvey | null> {
    try {
      const dbUpdates = this.mapNPSSurveyToDatabaseSurvey(updates as NPSSurvey);
      
      const { data, error } = await supabase
        .from('nps_surveys')
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseSurveyToNPSSurvey(data);
    } catch (error) {
      // Log desabilitado: Error updating survey
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

      if (error) throw error;
      return true;
    } catch (error) {
      // Log desabilitado: Error deleting survey
      return false;
    }
  }

  // Adicionar resposta
  static async addResponse(response: Omit<NPSResponse, 'id'>): Promise<NPSResponse | null> {
    try {
      const dbResponse = this.mapNPSResponseToDatabaseResponse(response);
      
      const { data, error } = await supabase
        .from('nps_responses')
        .insert([dbResponse])
        .select(`
          *,
          nps_surveys(title),
          users(full_name, department)
        `)
        .single();

      if (error) throw error;

      return this.mapDatabaseResponseToNPSResponse(data);
    } catch (error) {
      // Log desabilitado: Error adding response
      return null;
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

      const npsResponses = responses.filter(r => r.score >= 0 && r.score <= 10);
      const satisfactionResponses = responses.filter(r => r.score >= 0 && r.score <= 5);

      // Cálculos NPS
      const promoters = npsResponses.filter(r => r.score >= 9).length;
      const neutrals = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
      const detractors = npsResponses.filter(r => r.score <= 6).length;
      
      const npsScore = npsResponses.length > 0 
        ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
        : 0;

      // Cálculos Satisfação
      const satisfied = satisfactionResponses.filter(r => r.score >= 4).length;
      const neutralSatisfaction = satisfactionResponses.filter(r => r.score === 3).length;
      const dissatisfied = satisfactionResponses.filter(r => r.score <= 2).length;

      return {
        currentScore: npsScore,
        previousScore: 0, // TODO: Implementar cálculo histórico
        promoters: Math.round((promoters / npsResponses.length) * 100) || 0,
        neutrals: Math.round((neutrals / npsResponses.length) * 100) || 0,
        detractors: Math.round((detractors / npsResponses.length) * 100) || 0,
        totalResponses: responses.length,
        responseRate: 85, // TODO: Calcular baseado em funcionários ativos
        satisfied: Math.round((satisfied / satisfactionResponses.length) * 100) || 0,
        neutralSatisfaction: Math.round((neutralSatisfaction / satisfactionResponses.length) * 100) || 0,
        dissatisfied: Math.round((dissatisfied / satisfactionResponses.length) * 100) || 0
      };
    } catch (error) {
      // Log desabilitado: Error calculating statistics
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

  // Criar configuração de automação
  static async createAutomationConfig(config: Omit<NPSAutomationConfig, 'id' | 'created_at' | 'updated_at'>): Promise<NPSAutomationConfig | null> {
    try {
      const { data, error } = await supabase
        .from('nps_automation_config')
        .insert([config])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Log desabilitado: Error creating automation config
      return null;
    }
  }

  // Atualizar configuração de automação
  static async updateAutomationConfig(id: string, updates: Partial<NPSAutomationConfig>): Promise<NPSAutomationConfig | null> {
    try {
      const { data, error } = await supabase
        .from('nps_automation_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Log desabilitado: Error updating automation config
      return null;
    }
  }

  // Buscar configurações de automação
  static async getAutomationConfigs(surveyId?: string): Promise<NPSAutomationConfig[]> {
    try {
      let query = supabase
        .from('nps_automation_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (surveyId) {
        query = query.eq('survey_id', surveyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      // Log desabilitado: Error fetching automation configs
      return [];
    }
  }

  // Buscar pesquisas ativas para automação
  static async getActiveSurveysForAutomation(): Promise<(DatabaseNPSSurvey & { automation_config: NPSAutomationConfig })[]> {
    try {
      const { data, error } = await supabase
        .from('nps_surveys')
        .select(`
          *,
          nps_automation_config!inner(*)
        `)
        .eq('auto_send', true)
        .eq('nps_automation_config.is_active', true)
        .lte('nps_automation_config.next_execution_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Log desabilitado: Error fetching active surveys for automation
      return [];
    }
  }

  // Marcar pesquisa como enviada
  static async markSurveyAsSent(surveyId: string, nextExecutionDate: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('nps_automation_config')
        .update({
          last_execution_date: new Date().toISOString().split('T')[0],
          next_execution_date: nextExecutionDate,
          updated_at: new Date().toISOString()
        })
        .eq('survey_id', surveyId);

      if (error) throw error;
      return true;
    } catch (error) {
      // Log desabilitado: Error marking survey as sent
      return false;
    }
  }

  // Buscar evolução do NPS
  static async getNPSEvolution(): Promise<NPSEvolution[]> {
    try {
      // TODO: Implementar cálculo de evolução baseado em dados históricos
      // Por enquanto, retorna dados mockados
      return [
        { date: '2024-01', score: 45, responses: 18 },
        { date: '2024-02', score: 58, responses: 22 },
        { date: '2024-03', score: 65, responses: 23 }
      ];
    } catch (error) {
      // Log desabilitado: Error fetching evolution
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
      autoSend: dbSurvey.auto_send,
      frequencyDays: dbSurvey.frequency_days,
      lastSentAt: dbSurvey.last_sent_at,
      nextSendDate: dbSurvey.next_send_date
    };
  }

  private static mapNPSSurveyToDatabaseSurvey(survey: NPSSurvey): Partial<DatabaseNPSSurvey> {
    return {
      title: survey.title,
      description: survey.description,
      survey_type: survey.surveyType || 'nps',
      start_date: survey.startDate,
      end_date: survey.endDate,
      status: survey.status,
      target_employees: survey.targetEmployees || [],
      target_departments: survey.targetDepartments || [],
      question: survey.questions[0]?.question || 'Como você avaliaria nossa empresa?',
      is_anonymous: true,
      auto_send: false,
      frequency_days: 0,
      last_sent_at: null,
      next_send_date: null
    };
  }

  private static mapDatabaseResponseToNPSResponse(dbResponse: any): NPSResponse {
    return {
      id: dbResponse.id,
      employeeId: dbResponse.employee_id,
      employeeName: dbResponse.users?.full_name || 'Anônimo',
      score: dbResponse.score,
      comment: dbResponse.comment || '',
      date: dbResponse.created_at.split('T')[0],
      surveyId: dbResponse.survey_id,
      category: this.categorizeResponse(dbResponse.score, 'nps'),
      department: dbResponse.users?.department || 'Não informado'
    };
  }

  private static mapNPSResponseToDatabaseResponse(response: Omit<NPSResponse, 'id'>): Partial<DatabaseNPSResponse> {
    return {
      survey_id: response.surveyId,
      employee_id: response.employeeId,
      score: response.score,
      comment: response.comment
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