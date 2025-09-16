
import { supabase } from '@/integrations/supabase/client';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

export const evaluationService = {
  async getEvaluations(): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
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
        employee:users!employee_id(full_name, position),
        evaluator:users!evaluator_id(full_name)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      // Log desabilitado: Error getting evaluations
      throw error;
    }
    
    // Transform the data to match the frontend interface
    const transformedData = data?.map(evaluation => {
      return {
        id: evaluation.id,
        employeeId: evaluation.employee_id,
        employee: evaluation.employee?.full_name || 'Unknown',
        role: evaluation.employee?.position || 'Unknown',
        evaluator: evaluation.evaluator?.full_name || 'Unknown',
        evaluatorId: evaluation.evaluator_id,
        type: this.mapEvaluationType(evaluation.type),
        period: evaluation.period,
        status: this.mapEvaluationStatus(evaluation.status),
        score: parseFloat(evaluation.score) || 0,
        date: evaluation.date,
        comments: evaluation.comments,
        location: evaluation.location,
        topics: evaluation.topics || [],
        meetingDate: evaluation.meeting_date,
        meetingTime: evaluation.meeting_time,
        followUpActions: evaluation.follow_up_actions,
        confidential: evaluation.confidential
      };
    }) || [];
    
    return transformedData;
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
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
        employee:users!employee_id(full_name, position),
        evaluator:users!evaluator_id(full_name)
      `)
      .single();

    if (error) {
      // Log desabilitado: Error creating evaluation
      throw error;
    }

    // Transform the response to match frontend interface
    return {
      id: data.id,
      employeeId: data.employee_id,
      employee: data.employee?.full_name || 'Unknown',
      role: data.employee?.position || 'Unknown',
      evaluator: data.evaluator?.full_name || 'Unknown',
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
        confidential
      `)
      .single();
    
    if (error) {
      // Log desabilitado: Error updating evaluation
      throw error;
    }

    // Get employee and evaluator information separately
    const { data: employeeData } = await supabase
      .from('users')
      .select('full_name, position')
      .eq('id', data.employee_id)
      .single();

    const { data: evaluatorData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', data.evaluator_id)
      .single();

    return {
      id: data.id,
      employeeId: data.employee_id,
      employee: employeeData?.full_name || 'Unknown',
      role: employeeData?.position || 'Unknown',
      evaluator: evaluatorData?.full_name || 'Unknown',
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
  },

  async deleteEvaluation(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);
    
    if (error) {
      // Log desabilitado: Error deleting evaluation
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
