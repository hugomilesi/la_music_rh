
import { supabase } from '@/integrations/supabase/client';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

export const evaluationService = {
  async getEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(name, position),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
    
    // Transform the data to match the frontend interface
    return data?.map(evaluation => {
      return {
        ...evaluation,
        employeeId: evaluation.employee_id,
        employee: evaluation.employee?.name || 'Unknown',
        role: evaluation.employee?.position || 'Unknown',
        evaluator: evaluation.evaluator?.name,
        type: this.mapEvaluationType(evaluation.type),
        status: this.mapEvaluationStatus(evaluation.status),
        score: evaluation.score || 0, // Ensure score is always a number
        topics: evaluation.topics || []
      };
    }) || [];
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
    const dbData = {
      employee_id: evaluationData.employeeId,
      evaluator_id: evaluationData.evaluatorId || evaluationData.employeeId, // Use employee as evaluator if no evaluator provided
      date: new Date().toISOString().split('T')[0], // Set current date as required field
      type: this.mapEvaluationTypeToDb(evaluationData.type),
      status: 'pendente', // Set default status as required field
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
        employee:employees!evaluations_employee_id_fkey(name, position),
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
      evaluator: data.evaluator?.name,
      type: this.mapEvaluationType(data.type),
      status: this.mapEvaluationStatus(data.status),
      score: data.score || 0, // Ensure score is always a number
      topics: data.topics || []
    };
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    // Map camelCase frontend fields to snake_case database fields
  const dbUpdates: any = {};
  
  // Map specific camelCase fields to snake_case
  const fieldMapping: Record<string, string> = {
    followUpActions: 'follow_up_actions',
    meetingDate: 'meeting_date',
    meetingTime: 'meeting_time'
  };
  
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
    
    const { data, error } = await supabase
      .from('evaluations')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        employee:employees!evaluations_employee_id_fkey(name, position),
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
      evaluator: data.evaluator?.name,
      type: this.mapEvaluationType(data.type),
      status: this.mapEvaluationStatus(data.status),
      score: data.score || 0, // Ensure score is always a number
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
  },

  mapEvaluationStatusToDb(frontendStatus: Evaluation['status']): string {
    const statusMap: Record<Evaluation['status'], string> = {
      'Pendente': 'pendente',
      'Em Andamento': 'em_andamento',
      'Concluída': 'concluida'
    };
    return statusMap[frontendStatus] || 'pendente';
  }
};
