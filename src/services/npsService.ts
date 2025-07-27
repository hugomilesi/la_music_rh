import { createClient } from '@supabase/supabase-js';
import { NPSResponse, NPSSurvey, NPSStats, NPSEvolution } from '@/types/nps';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://grbajpcxfmxeexqthpwz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYmFqcGN4Zm14ZWV4cXRocHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNzEwMDAsImV4cCI6MjA2NzY0NzAwMH0.NZ2B_wF1caWMrj3QNt_pw8Z2wunVM2njuHkZmJv3f-M';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  titulo: string;
  descricao?: string;
  pergunta: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  anonimo: boolean;
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
      console.error('Erro ao buscar pesquisas:', error);
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
      console.error('Erro ao buscar respostas:', error);
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
      console.error('Erro ao criar pesquisa:', error);
      return null;
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
      console.error('Erro ao atualizar pesquisa:', error);
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
      console.error('Erro ao deletar pesquisa:', error);
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
      console.error('Erro ao adicionar resposta:', error);
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
      console.error('Erro ao calcular estatísticas:', error);
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
      console.error('Erro ao buscar evolução:', error);
      return [];
    }
  }

  // Mappers para converter entre formatos do banco e da aplicação
  private static mapDatabaseSurveyToNPSSurvey(dbSurvey: any): NPSSurvey {
    return {
      id: dbSurvey.id,
      title: dbSurvey.title,
      description: dbSurvey.description || '',
      questions: [
        {
          id: 'q1',
          type: 'nps',
          question: 'Como você avaliaria nossa empresa?',
          required: true
        }
      ],
      status: dbSurvey.status as 'draft' | 'active' | 'completed',
      startDate: dbSurvey.start_date,
      endDate: dbSurvey.end_date,
      responses: [],
      targetEmployees: dbSurvey.target_employees || [],
      targetDepartments: dbSurvey.target_departments || [],
      surveyType: dbSurvey.survey_type || 'nps'
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
      target_departments: survey.targetDepartments || []
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