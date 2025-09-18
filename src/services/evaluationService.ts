
import { supabase } from '@/integrations/supabase/client';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

export const evaluationService = {
  async getEvaluations(): Promise<Evaluation[]> {
    try {
      console.log('🔄 EvaluationService: Buscando avaliações...');
      
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          employee:users!employee_id(id, username, email),
          evaluator:users!evaluator_id(id, username, email)
        `)
        .order('date', { ascending: false }); // Banco usa 'date' não 'meeting_date'

      if (error) {
        console.error('❌ EvaluationService: Erro ao buscar avaliações:', error);
        throw error;
      }

      console.log('✅ EvaluationService: Avaliações encontradas:', data?.length || 0);

      return data.map(evaluation => ({
        id: evaluation.id,
        employeeId: evaluation.employee_id,
        employee: evaluation.employee?.username || 'Unknown',
        evaluatorId: evaluation.evaluator_id,
        evaluator: evaluation.evaluator?.username || 'Unknown',
        type: evaluation.type,
        period: evaluation.period,
        status: evaluation.status,
        score: evaluation.score,
        date: evaluation.date, // Banco usa 'date'
        meetingDate: evaluation.meeting_date, // Fallback para compatibilidade
        meetingTime: evaluation.meeting_time,
        comments: evaluation.comments,
        location: evaluation.location,
        topics: evaluation.topics || [],
        followUpActions: evaluation.follow_up_actions,
        confidential: evaluation.confidential || false,
        evaluationPeriodStart: evaluation.evaluation_period_start,
        evaluationPeriodEnd: evaluation.evaluation_period_end,
        evaluationType: evaluation.evaluation_type,
        overallScore: evaluation.overall_score,
        competenciesScore: evaluation.competencies_score,
        goalsAchievement: evaluation.goals_achievement,
        strengths: evaluation.strengths,
        areasForImprovement: evaluation.areas_for_improvement,
        developmentPlan: evaluation.development_plan,
        evaluatorComments: evaluation.evaluator_comments,
        hrComments: evaluation.hr_comments,
        nextReviewDate: evaluation.next_review_date,
        completedAt: evaluation.completed_at,
        approvedAt: evaluation.approved_at,
        approvedBy: evaluation.approved_by,
        createdAt: evaluation.created_at,
        updatedAt: evaluation.updated_at
      }));
    } catch (error) {
      console.error('❌ EvaluationService: Erro ao buscar avaliações:', error);
      throw error;
    }
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
    try {
      console.log('🔄 EvaluationService: Criando nova avaliação:', evaluationData);
      
      // Map frontend data to database format
      const dbData = {
        employee_id: evaluationData.employeeId,
        evaluator_id: evaluationData.evaluatorId || evaluationData.employeeId,
        type: this.mapEvaluationTypeToDb(evaluationData.type),
        period: evaluationData.period,
        status: 'em_andamento',
        score: 0,
        comments: evaluationData.comments || null,
        location: evaluationData.location || null,
        topics: evaluationData.topics || null,
        meeting_date: evaluationData.meetingDate || null,
        meeting_time: evaluationData.meetingTime || null,
        follow_up_actions: evaluationData.followUpActions || null,
        confidential: evaluationData.confidential || false
      };

      const { data, error } = await supabase
        .from('evaluations')
        .insert(dbData)
        .select(`
          id,
          employee_id,
          evaluator_id,
          type,
          period,
          status,
          score,
          date,
          comments,
          location,
          topics,
          meeting_date,
          meeting_time,
          follow_up_actions,
          confidential,
          employee:users!employee_id(username, position),
          evaluator:users!evaluator_id(username)
        `)
        .single();

      if (error) {
        console.error('❌ EvaluationService: Erro ao criar avaliação:', error);
        throw error;
      }

      console.log('✅ EvaluationService: Avaliação criada com sucesso:', data.id);

      // Transform the response to match frontend interface
      return {
        id: data.id,
        employeeId: data.employee_id,
        employee: data.employee?.username || 'Unknown',
        role: data.employee?.position || 'Unknown',
        evaluator: data.evaluator?.username || 'Unknown',
        evaluatorId: data.evaluator_id,
        type: this.mapEvaluationType(data.type),
        period: data.period,
        status: this.mapEvaluationStatus(data.status),
        score: parseFloat(data.score) || 0,
        date: data.date,
        comments: data.comments,
        location: data.location,
        topics: data.topics || [],
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        followUpActions: data.follow_up_actions,
        confidential: data.confidential
      };
    } catch (error) {
      console.error('❌ EvaluationService: Erro ao criar avaliação:', error);
      throw error;
    }
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    try {
      console.log('🔄 EvaluationService: Atualizando avaliação:', { id, updates });
      
      // Map camelCase frontend fields to snake_case database fields
      const dbUpdates: any = {};
      
      // Map specific camelCase fields to snake_case
      const fieldMapping: Record<string, string> = {
        followUpActions: 'follow_up_actions',
        meetingDate: 'meeting_date',
        meetingTime: 'meeting_time'
      };
      
      // Check if score is being updated and automatically set status to completed
      const isScoreUpdate = updates.score !== undefined && updates.score > 0;
      
      Object.keys(updates).forEach((key: string) => {
        const value = (updates as any)[key];
        
        // Skip empty string values for date and time fields to avoid database errors
        if ((key === 'meetingDate' || key === 'meetingTime') && value === '') {
          return;
        }
        
        if (key === 'status') {
          dbUpdates.status = this.mapEvaluationStatusToDb(updates.status!);
        } else if (fieldMapping[key]) {
          // Only add non-empty values for mapped fields
          if (value !== '' && value !== null && value !== undefined) {
            dbUpdates[fieldMapping[key]] = value;
          }
        } else {
          // Fields that don't need mapping (score, location, topics, confidential, etc.)
          // Only add non-empty values
          if (value !== '' && value !== null && value !== undefined) {
            dbUpdates[key] = value;
          }
        }
      });
      
      // Automatically set status to completed and update date when score is provided
      if (isScoreUpdate) {
        dbUpdates.status = 'concluida';
        dbUpdates.date = new Date().toISOString().split('T')[0];
      }
        
      const { data, error } = await supabase
        .from('evaluations')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          id,
          employee_id,
          evaluator_id,
          type,
          period,
          status,
          score,
          date,
          comments,
          location,
          topics,
          meeting_date,
          meeting_time,
          follow_up_actions,
          confidential,
          employee:users!employee_id(username, position),
          evaluator:users!evaluator_id(username)
        `)
        .single();
      
      if (error) {
        console.error('❌ EvaluationService: Erro ao atualizar avaliação:', error);
        throw error;
      }

      // Get employee and evaluator information separately
      const { data: employeeData } = await supabase
        .from('users')
        .select('username, position')
        .eq('id', data.employee_id)
        .single();

      const { data: evaluatorData } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.evaluator_id)
        .single();

      console.log('✅ EvaluationService: Avaliação atualizada com sucesso:', data.id);

      return {
        id: data.id,
        employeeId: data.employee_id,
        employee: employeeData?.username || 'Unknown',
        role: employeeData?.position || 'Unknown',
        evaluator: evaluatorData?.username || 'Unknown',
        evaluatorId: data.evaluator_id,
        type: this.mapEvaluationType(data.type),
        period: data.period,
        status: this.mapEvaluationStatus(data.status),
        score: data.score || 0,
        date: data.date,
        comments: data.comments,
        location: data.location,
        topics: data.topics || [],
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        followUpActions: data.follow_up_actions,
        confidential: data.confidential
      };
    } catch (error) {
      console.error('❌ EvaluationService: Erro ao atualizar avaliação:', error);
      throw error;
    }
  },

  async deleteEvaluation(id: string): Promise<void> {
    try {
      console.log('🔄 EvaluationService: Deletando avaliação:', id);
      
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ EvaluationService: Erro ao deletar avaliação:', error);
        throw error;
      }
      
      console.log('✅ EvaluationService: Avaliação deletada com sucesso:', id);
    } catch (error) {
      console.error('❌ EvaluationService: Erro ao deletar avaliação:', error);
      throw error;
    }
  },

  // Helper methods to map between frontend and database types
  mapEvaluationType(dbType: string): Evaluation['type'] {
    const typeMap: Record<string, Evaluation['type']> = {
      'avaliacao_360': 'Avaliação 360°',
      'auto_avaliacao': 'Auto Avaliação',
      'avaliacao_gestor': 'Avaliação do Gestor',
      'coffee_connection': 'Coffee Connection'
    };
    return typeMap[dbType] || 'Avaliação 360°';
  },

  mapEvaluationTypeToDb(frontendType: Evaluation['type']): string {
    const typeMap: Record<Evaluation['type'], string> = {
      'Avaliação 360°': 'avaliacao_360',
      'Auto Avaliação': 'auto_avaliacao',
      'Avaliação do Gestor': 'avaliacao_gestor',
      'Coffee Connection': 'coffee_connection'
    };
    return typeMap[frontendType] || 'avaliacao_360';
  },

  mapEvaluationStatus(dbStatus: string): Evaluation['status'] {
    const statusMap: Record<string, Evaluation['status']> = {
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída'
    };
    return statusMap[dbStatus] || 'Em Andamento';
  },

  mapEvaluationStatusToDb(frontendStatus: Evaluation['status']): string {
    const statusMap: Record<Evaluation['status'], string> = {
      'Em Andamento': 'em_andamento',
      'Concluída': 'concluida'
    };
    return statusMap[frontendStatus] || 'em_andamento';
  },


};
