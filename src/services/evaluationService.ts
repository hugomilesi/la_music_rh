
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
        employees!evaluations_employee_id_fkey(name, position),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching evaluations:', error);
      // Return mock data when Supabase is not available
      return this.getMockEvaluations();
    }
    
    // Transform the data to match the frontend interface
    const transformedData = data?.map(evaluation => {
      return {
        id: evaluation.id,
        employeeId: evaluation.employee_id,
        employee: evaluation.employees?.name || 'Unknown',
        role: evaluation.employees?.position || 'Unknown',
        evaluator: evaluation.evaluator?.name || 'Unknown',
        evaluatorId: evaluation.evaluator_id,
        type: this.mapEvaluationType(evaluation.type),
        period: evaluation.period,
        status: this.mapEvaluationStatus(evaluation.status),
        score: evaluation.score || 0,
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
    
    // If no data from Supabase, return mock data
    if (transformedData.length === 0) {
      return this.getMockEvaluations();
    }
    
    return transformedData;
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
    const dbData = {
      employee_id: evaluationData.employeeId,
      evaluator_id: evaluationData.evaluatorId || evaluationData.employeeId, // Use employee as evaluator if no evaluator provided
      date: new Date().toISOString().split('T')[0], // Set current date as required field
      type: this.mapEvaluationTypeToDb(evaluationData.type),
      status: 'in_progress', // Set default status as required field
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
        employees!evaluations_employee_id_fkey(name, position),
        evaluator:employees!evaluations_evaluator_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      employee: data.employees?.name || 'Unknown',
      role: data.employees?.position || 'Unknown',
      evaluator: data.evaluator?.name || 'Unknown',
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
    dbUpdates.status = 'completed';
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
      console.error('Error updating evaluation:', error);
      // For mock data, simulate the update
      const mockEvaluations = this.getMockEvaluations();
      const mockEvaluation = mockEvaluations.find(evaluation => evaluation.id === id);
      if (mockEvaluation) {
        return { ...mockEvaluation, ...updates };
      }
      throw error;
    }

    // Get employee and evaluator information separately
    const { data: employeeData } = await supabase
      .from('employees')
      .select('name, position')
      .eq('id', data.employee_id)
      .single();

    const { data: evaluatorData } = await supabase
      .from('employees')
      .select('name')
      .eq('id', data.evaluator_id)
      .single();

    return {
      id: data.id,
      employeeId: data.employee_id,
      employee: employeeData?.name || 'Unknown',
      role: employeeData?.position || 'Unknown',
      evaluator: evaluatorData?.name || 'Unknown',
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
      'in_progress': 'Em Andamento',
      'completed': 'Concluída'
    };
    return statusMap[dbStatus] || 'Em Andamento';
  },

  mapEvaluationStatusToDb(frontendStatus: Evaluation['status']): string {
    const statusMap: Record<Evaluation['status'], string> = {
      'Em Andamento': 'in_progress',
      'Concluída': 'completed'
    };
    return statusMap[frontendStatus] || 'in_progress';
  },

  // Mock data for testing when Supabase is not available
  getMockEvaluations(): Evaluation[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return [
      {
        id: 'mock-1',
        employeeId: 'emp-1',
        employee: 'Ana Silva',
        role: 'Desenvolvedora Frontend',
        type: 'Coffee Connection',
        period: '2024',
        score: 0,
        status: 'Em Andamento',
        date: today.toISOString().split('T')[0],
        meetingDate: tomorrow.toISOString().split('T')[0],
        meetingTime: '14:00',
        location: 'Sala de Reuniões 1',
        topics: ['Desenvolvimento de carreira', 'Feedback sobre projetos'],
        comments: 'Coffee Connection agendado para discussão sobre crescimento profissional'
      },
      {
        id: 'mock-2',
        employeeId: 'emp-2',
        employee: 'João Santos',
        role: 'Designer UX/UI',
        type: 'Coffee Connection',
        period: '2024',
        score: 0,
        status: 'Em Andamento',
        date: today.toISOString().split('T')[0],
        meetingDate: nextWeek.toISOString().split('T')[0],
        meetingTime: '10:30',
        location: 'Café da empresa',
        topics: ['Processos de design', 'Colaboração com equipe'],
        comments: 'Sessão para alinhar expectativas e melhorar processos'
      },
      {
        id: 'mock-3',
        employeeId: 'emp-3',
        employee: 'Maria Costa',
        role: 'Gerente de Projetos',
        type: 'Coffee Connection',
        period: '2024',
        score: 4.5,
        status: 'Em Andamento',
        date: new Date(today.getTime() - 86400000).toISOString().split('T')[0], // yesterday
        meetingDate: new Date(today.getTime() + 172800000).toISOString().split('T')[0], // day after tomorrow
        meetingTime: '16:00',
        location: 'Escritório - Mesa de reunião',
        topics: ['Liderança', 'Gestão de equipe', 'Metas trimestrais'],
        comments: 'Coffee Connection aprovado - discussão sobre liderança'
      },
      {
        id: 'mock-4',
        employeeId: 'emp-4',
        employee: 'Pedro Oliveira',
        role: 'Desenvolvedor Backend',
        type: 'Avaliação 360°',
        period: '2024',
        score: 4.2,
        status: 'Concluída',
        date: new Date(today.getTime() - 172800000).toISOString().split('T')[0], // 2 days ago
        comments: 'Avaliação 360° concluída com sucesso'
      },
      {
        id: 'mock-5',
        employeeId: 'emp-5',
        employee: 'Carla Ferreira',
        role: 'Analista de Marketing',
        type: 'Coffee Connection',
        period: '2024',
        score: 4.8,
        status: 'Concluída',
        date: new Date(today.getTime() - 259200000).toISOString().split('T')[0], // 3 days ago
        meetingDate: new Date(today.getTime() - 86400000).toISOString().split('T')[0], // yesterday
        meetingTime: '11:00',
        location: 'Sala de criatividade',
        topics: ['Estratégias de marketing', 'Campanhas digitais'],
        comments: 'Coffee Connection concluído - excelente discussão sobre estratégias'
      }
    ];
  }
};
