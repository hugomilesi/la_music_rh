import { supabase } from '@/integrations/supabase/client'
import type {
  Database,
  RecognitionProgram,
  RecognitionCriterion,
  EmployeeEvaluation,
  CriterionEvaluation,
  EmployeeAchievement,
  MonthlyProgress,
  EmployeeRanking
} from '../types/supabase-recognition'

export class RecognitionService {
  // Programas de Reconhecimento
  static async getPrograms(): Promise<RecognitionProgram[]> {
    try {
      console.log('RecognitionService: Buscando programas de reconhecimento...');
      
      const { data, error } = await supabase
        .from('recognition_programs')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('RecognitionService: Erro ao buscar programas:', error);
        throw error;
      }
      
      console.log('RecognitionService: Programas encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('RecognitionService: Erro em getPrograms:', error);
      throw error;
    }
  }

  static async getProgramById(id: string): Promise<RecognitionProgram | null> {
    try {
      console.log('RecognitionService: Buscando programa por ID:', id);
      
      const { data, error } = await supabase
        .from('recognition_programs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('RecognitionService: Erro ao buscar programa:', error);
        throw error;
      }
      
      console.log('RecognitionService: Programa encontrado:', data ? 'Sim' : 'Não');
      return data;
    } catch (error) {
      console.error('RecognitionService: Erro em getProgramById:', error);
      throw error;
    }
  }

  // Critérios de Reconhecimento
  static async getCriteriaByProgram(programId: string): Promise<RecognitionCriterion[]> {
    try {
      console.log('RecognitionService: Buscando critérios do programa:', programId);
      
      const { data, error } = await supabase
        .from('recognition_criteria')
        .select('*')
        .eq('program_id', programId)
        .order('order_index')

      if (error) {
        console.error('RecognitionService: Erro ao buscar critérios:', error);
        throw error;
      }
      
      console.log('RecognitionService: Critérios encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('RecognitionService: Erro em getCriteriaByProgram:', error);
      throw error;
    }
  }

  // Avaliações de Funcionários
  static async createEmployeeEvaluation(
    evaluation: Omit<EmployeeEvaluation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EmployeeEvaluation> {
    try {
      console.log('RecognitionService: Criando avaliação do funcionário:', evaluation.employee_id);
      
      const { data, error } = await supabase
        .from('employee_evaluations')
        .insert(evaluation)
        .select()
        .single()

      if (error) {
        console.error('RecognitionService: Erro ao criar avaliação:', error);
        throw error;
      }
      
      console.log('RecognitionService: Avaliação criada com sucesso:', data.id);
      return data;
    } catch (error) {
      console.error('RecognitionService: Erro em createEmployeeEvaluation:', error);
      throw error;
    }
  }

  static async getEmployeeEvaluations(
    employeeId: string,
    programId?: string,
    evaluationPeriod?: string
  ): Promise<EmployeeEvaluation[]> {
    try {
      console.log('RecognitionService: Buscando avaliações do funcionário:', employeeId);
      
      let query = supabase
        .from('employee_evaluations')
        .select('*')
        .eq('employee_id', employeeId)

      if (programId) {
        query = query.eq('program_id', programId)
      }

      if (evaluationPeriod) {
        query = query.eq('evaluation_period', evaluationPeriod)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('RecognitionService: Erro ao buscar avaliações:', error);
        throw error;
      }
      
      console.log('RecognitionService: Avaliações encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('RecognitionService: Erro em getEmployeeEvaluations:', error);
      throw error;
    }
  }

  // Avaliações de Critérios
  static async createCriterionEvaluations(
    evaluations: Omit<CriterionEvaluation, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<CriterionEvaluation[]> {
    const { data, error } = await supabase
      .from('criterion_evaluations')
      .insert(evaluations)
      .select()

    if (error) throw error
    return data || []
  }

  static async getCriterionEvaluations(evaluationId: string): Promise<CriterionEvaluation[]> {
    const { data, error } = await supabase
      .from('criterion_evaluations')
      .select('*')
      .eq('evaluation_id', evaluationId)

    if (error) throw error
    return data || []
  }

  // Conquistas de Funcionários
  static async createEmployeeAchievement(
    achievement: Omit<EmployeeAchievement, 'id' | 'created_at' | 'updated_at'>
  ): Promise<EmployeeAchievement> {
    const { data, error } = await supabase
      .from('employee_achievements')
      .insert(achievement)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getEmployeeAchievements(employeeId?: string): Promise<EmployeeAchievement[]> {
    let query = supabase
      .from('employee_achievements')
      .select(`
        *,
        users(username)
      `)
      .order('achievement_date', { ascending: false })
      .limit(10)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  // Progresso Mensal
  static async updateMonthlyProgress(
    employeeId: string,
    monthYear: string,
    progress: Partial<Pick<MonthlyProgress, 'fideliza_stars' | 'matriculador_stars' | 'professor_stars'>>
  ): Promise<MonthlyProgress> {
    const totalStars = (progress.fideliza_stars || 0) + 
                      (progress.matriculador_stars || 0) + 
                      (progress.professor_stars || 0)

    const { data, error } = await supabase
      .from('monthly_progress')
      .upsert({
        employee_id: employeeId,
        month_year: monthYear,
        ...progress,
        total_stars: totalStars
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getMonthlyProgress(
    employeeId: string,
    monthYear?: string
  ): Promise<MonthlyProgress[]> {
    let query = supabase
      .from('monthly_progress')
      .select('*')
      .eq('employee_id', employeeId)

    if (monthYear) {
      query = query.eq('month_year', monthYear)
    }

    const { data, error } = await query.order('month_year', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Ranking de Funcionários
  static async getEmployeeRanking(
    programFilter: string = 'all',
    evaluationPeriodFilter?: string
  ): Promise<EmployeeRanking[]> {
    // Convert 'all' to null for the UUID parameter
    const programFilterUuid = programFilter === 'all' ? null : programFilter;
    
    const { data, error } = await supabase
      .rpc('get_employee_ranking', {
        program_filter: programFilterUuid,
        evaluation_period_filter: evaluationPeriodFilter
      })

    if (error) throw error
    return data || []
  }

  // Detalhes do Funcionário
  static async getEmployeeRecognitionDetails(employeeId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_employee_recognition_details', {
        employee_id_param: employeeId
      })

    if (error) throw error
    return data
  }

  // Utilitários
  static async calculateEmployeeStars(
    employeeId: string,
    programId: string,
    evaluationPeriod: string
  ): Promise<number> {
    const evaluations = await this.getEmployeeEvaluations(employeeId, programId, evaluationPeriod)
    return evaluations.reduce((total, evaluation) => total + evaluation.total_stars, 0)
  }

  static async getEligiblePrograms(employeeRole: string): Promise<RecognitionProgram[]> {
    const { data, error } = await supabase
      .from('recognition_programs')
      .select('*')
      .contains('target_roles', [employeeRole])
      .eq('is_active', true)

    if (error) throw error
    return data || []
  }

  // Avaliação Completa
  static async submitCompleteEvaluation({
    employeeId,
    programId,
    evaluationPeriod,
    evaluatorId,
    criteriaEvaluations,
    notes
  }: {
    employeeId: string
    programId: string
    evaluationPeriod: string
    evaluatorId: string
    criteriaEvaluations: Array<{
      criterionId: string
      isMet: boolean
      starsAwarded?: number
      observation?: string
    }>
    notes?: string
  }): Promise<{ evaluation: EmployeeEvaluation; criterionEvaluations: CriterionEvaluation[] }> {
    // Calcular total de estrelas
    const totalStars = criteriaEvaluations.reduce((total, ce) => {
      return total + (ce.starsAwarded || 0)
    }, 0)

    // Criar avaliação do funcionário
    const evaluation = await this.createEmployeeEvaluation({
      employee_id: employeeId,
      program_id: programId,
      evaluation_period: evaluationPeriod,
      total_stars: totalStars,
      evaluated_by: evaluatorId,
      evaluation_date: new Date().toISOString().split('T')[0],
      comments: notes
    })

    // Criar avaliações dos critérios
    const criterionEvals = await this.createCriterionEvaluations(
      criteriaEvaluations.map(ce => ({
        evaluation_id: evaluation.id,
        criterion_id: ce.criterionId,
        is_met: ce.isMet,
        stars_awarded: ce.starsAwarded,
        observation: ce.observation
      }))
    )

    // Atualizar progresso mensal
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const currentProgress = await this.getMonthlyProgress(employeeId, currentMonth)
    
    if (currentProgress.length > 0) {
      const progress = currentProgress[0]
      const updatedProgress: any = {}
      
      if (programId === 'fideliza') {
        updatedProgress.fideliza_stars = (progress.fideliza_stars || 0) + totalStars
      } else if (programId === 'matriculador') {
        updatedProgress.matriculador_stars = (progress.matriculador_stars || 0) + totalStars
      } else if (programId === 'professor') {
        updatedProgress.professor_stars = (progress.professor_stars || 0) + totalStars
      }
      
      await this.updateMonthlyProgress(employeeId, currentMonth, updatedProgress)
    } else {
      const newProgress: any = {
        fideliza_stars: 0,
        matriculador_stars: 0,
        professor_stars: 0
      }
      
      if (programId === 'fideliza') {
        newProgress.fideliza_stars = totalStars
      } else if (programId === 'matriculador') {
        newProgress.matriculador_stars = totalStars
      } else if (programId === 'professor') {
        newProgress.professor_stars = totalStars
      }
      
      await this.updateMonthlyProgress(employeeId, currentMonth, newProgress)
    }

    return { evaluation, criterionEvaluations: criterionEvals }
  }

  // Função para atualizar uma avaliação existente
  static async updateEmployeeEvaluation(evaluationId: string, data: {
    programId: string;
    evaluationPeriod: string;
    notes?: string;
    criteriaEvaluations: Array<{
      criterionId: string;
      isMet: boolean;
      starsAwarded: number;
      observation?: string;
    }>;
  }) {
    try {
      const totalStars = data.criteriaEvaluations.reduce((sum, ce) => sum + ce.starsAwarded, 0);

      // 1. Atualizar a avaliação do funcionário
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .update({
          program_id: data.programId,
          evaluation_period: data.evaluationPeriod,
          total_stars: totalStars,
          comments: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', evaluationId)
        .select()
        .single();

      if (evalError) throw evalError;

      // 2. Deletar avaliações de critérios existentes
      const { error: deleteError } = await supabase
        .from('criterion_evaluations')
        .delete()
        .eq('evaluation_id', evaluationId);

      if (deleteError) throw deleteError;

      // 3. Inserir novas avaliações de critérios
      const criteriaEvaluations = data.criteriaEvaluations.map(ce => ({
        evaluation_id: evaluationId,
        criterion_id: ce.criterionId,
        is_met: ce.isMet,
        stars_awarded: ce.starsAwarded,
        observation: ce.observation
      }));

      const { error: criteriaError } = await supabase
        .from('criterion_evaluations')
        .insert(criteriaEvaluations);

      if (criteriaError) throw criteriaError;

      // 4. Atualizar o progresso mensal
      await this.updateMonthlyProgress(evaluation.employee_id, data.evaluationPeriod);

      return evaluation;
    } catch (error) {
      console.log('RecognitionService: ❌ Erro em updateEmployeeEvaluation:', error);
      throw error;
    }
  }

  // Função para deletar uma avaliação
  static async deleteEmployeeEvaluation(evaluationId: string) {
    try {
      console.log('🔄 RecognitionService: Deletando avaliação do funcionário:', evaluationId);
      
      // 1. Buscar dados da avaliação antes de deletar
      const { data: evaluation, error: fetchError } = await supabase
        .from('evaluations')
        .select('employee_id, evaluation_period')
        .eq('id', evaluationId)
        .single();

      if (fetchError) {
        console.error('❌ RecognitionService: Erro ao buscar dados da avaliação:', fetchError);
        throw fetchError;
      }

      // 2. Deletar avaliações de critérios
      const { error: criteriaError } = await supabase
        .from('criterion_evaluations')
        .delete()
        .eq('evaluation_id', evaluationId);

      if (criteriaError) {
        console.error('❌ RecognitionService: Erro ao deletar avaliações de critérios:', criteriaError);
        throw criteriaError;
      }

      // 3. Deletar a avaliação
      const { error: evalError } = await supabase
        .from('employee_evaluations')
        .delete()
        .eq('id', evaluationId);

      if (evalError) {
        console.error('❌ RecognitionService: Erro ao deletar avaliação:', evalError);
        throw evalError;
      }

      // 4. Atualizar o progresso mensal
      await this.updateMonthlyProgress(evaluation.employee_id, evaluation.evaluation_period);

      console.log('✅ RecognitionService: Avaliação deletada com sucesso:', evaluationId);
      return true;
    } catch (error) {
      console.error('❌ RecognitionService: Erro em deleteEmployeeEvaluation:', error);
      throw error;
    }
  }
}