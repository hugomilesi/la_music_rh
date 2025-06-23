
import { supabase } from '@/integrations/supabase/client';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

export const evaluationService = {
  async getEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(name, position, units),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
    
    // Transform the data to match the frontend interface
    return data?.map(evaluation => ({
      ...evaluation,
      employeeId: evaluation.employee_id,
      employee: evaluation.employee?.name || 'Unknown',
      role: evaluation.employee?.position || 'Unknown',
      unit: evaluation.employee?.units?.[0] || 'campo-grande',
      evaluator: evaluation.evaluator?.name,
      type: this.mapEvaluationType(evaluation.type),
      status: this.mapEvaluationStatus(evaluation.status),
      topics: evaluation.topics || []
    })) || [];
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
    const dbData = {
      employee_id: evaluationData.employeeId,
      evaluator_id: evaluationData.evaluatorId,
      type: this.mapEvaluationTypeToDb(evaluationData.type),
      period: evaluationData.period,
      comments: evaluationData.comments,
      meeting_date: evaluationData.meetingDate,
      meeting_time: evaluationData.meetingTime,
      location: evaluationData.location,
      topics: evaluationData.topics,
      follow_up_actions: evaluationData.followUpActions,
      confidential: evaluationData.confidential
    };

    const { data, error } = await supabase
      .from('evaluations')
      .insert([dbData])
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(name, position, units),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
    
    return {
      ...data,
      employeeId: data.employee_id,
      employee: data.employee?.name || 'Unknown',
      role: data.employee?.position || 'Unknown',
      unit: data.employee?.units?.[0] || 'campo-grande',
      evaluator: data.evaluator?.name,
      type: this.mapEvaluationType(data.type),
      status: this.mapEvaluationStatus(data.status),
      topics: data.topics || []
    };
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(name, position, units),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
    
    return {
      ...data,
      employeeId: data.employee_id,
      employee: data.employee?.name || 'Unknown',
      role: data.employee?.position || 'Unknown',
      unit: data.employee?.units?.[0] || 'campo-grande',
      evaluator: data.evaluator?.name,
      type: this.mapEvaluationType(data.type),
      status: this.mapEvaluationStatus(data.status),
      topics: data.topics || []
    };
  },

  async deleteEvaluation(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting evaluation:', error);
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
      'pendente': 'Pendente',
      'em_andamento': 'Em Andamento',
      'concluida': 'Concluída'
    };
    return statusMap[dbStatus] || 'Pendente';
  }
};
