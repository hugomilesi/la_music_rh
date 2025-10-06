
import { supabase } from '@/integrations/supabase/client';
import { Evaluation, NewEvaluationData } from '@/types/evaluation';

export const evaluationService = {
  // Helper functions for status mapping
  mapEvaluationStatusFromDb(dbStatus: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Rascunho',
      'submitted': 'Em Andamento',
      'reviewed': 'Em Análise',
      'finalized': 'Concluída'
    };
    return statusMap[dbStatus] || dbStatus;
  },

  mapEvaluationStatusToDb(frontendStatus: string): string {
    const statusMap: Record<string, string> = {
      'Rascunho': 'draft',
      'Em Andamento': 'submitted',
      'Em Análise': 'reviewed',
      'Concluída': 'finalized'
    };
    return statusMap[frontendStatus] || 'submitted';
  },

  formatPeriodFromDates(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.getMonth() + 1; // getMonth() retorna 0-11
    const endMonth = end.getMonth() + 1;
    
    // Determinar o trimestre baseado nos meses
    if (startMonth === 1 && endMonth === 3) {
      return '1º Trimestre';
    } else if (startMonth === 4 && endMonth === 6) {
      return '2º Trimestre';
    } else if (startMonth === 7 && endMonth === 9) {
      return '3º Trimestre';
    } else if (startMonth === 10 && endMonth === 12) {
      return '4º Trimestre';
    }
    
    // Formato padrão se não for um trimestre completo
    return `${start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
  },

  mapEvaluationStatus(dbStatus: string): Evaluation['status'] {
    return this.mapEvaluationStatusFromDb(dbStatus) as Evaluation['status'];
  },

  async createEvaluation(data: NewEvaluationData): Promise<Evaluation> {
    try {
      
      // Determinar o período de avaliação baseado na data
      const evaluationDate = new Date(data.evaluation_date);
      const year = evaluationDate.getFullYear();
      const month = evaluationDate.getMonth() + 1; // getMonth() retorna 0-11
      
      // Determinar trimestre
      let quarter: number;
      if (month >= 1 && month <= 3) quarter = 1;
      else if (month >= 4 && month <= 6) quarter = 2;
      else if (month >= 7 && month <= 9) quarter = 3;
      else quarter = 4;
      
      // Calcular datas de início e fim do trimestre
      const quarterStartMonth = (quarter - 1) * 3 + 1;
      const quarterEndMonth = quarter * 3;
      
      const evaluationPeriodStart = `${year}-${quarterStartMonth.toString().padStart(2, '0')}-01`;
      const evaluationPeriodEnd = `${year}-${quarterEndMonth.toString().padStart(2, '0')}-${new Date(year, quarterEndMonth, 0).getDate()}`;
      
      console.log('Evaluation period calculated:', {
        year,
        month,
        quarter,
        evaluationPeriodStart,
        evaluationPeriodEnd
      });

      // Validar dados obrigatórios
      if (!data.employee_id) {
        throw new Error('employee_id é obrigatório');
      }
      // evaluator_id é obrigatório apenas para avaliações que não sejam Auto Avaliação
      if (!data.evaluator_id && data.evaluation_type !== 'Auto Avaliação') {
        throw new Error('evaluator_id é obrigatório para este tipo de avaliação');
      }
      if (!data.evaluation_date) {
        throw new Error('evaluation_date é obrigatório');
      }

      // Mapear dados para o formato do banco
      const dbData = {
        employee_id: data.employee_id, // Manter como string UUID
        evaluator_id: data.evaluator_id || null, // Permitir null para Auto Avaliação
        evaluation_period_start: evaluationPeriodStart,
        evaluation_period_end: evaluationPeriodEnd,
        feedback: data.comments || '',
        status: 'submitted', // Status válido conforme constraint
        date: data.evaluation_date,
        evaluation_type: data.evaluation_type,
        unit: data.unit
      };

      // Adicionar campos específicos do Coffee Connection se aplicável
      if (data.evaluation_type === 'Coffee Connection') {
        Object.assign(dbData, {
          meeting_time: data.meetingTime,
          location: data.location,
          topics: data.topics,
          follow_up_actions: data.followUpActions,
          confidential: data.confidential || false
        });
      }


      // Inserir no banco de dados
      const { data: insertedData, error } = await supabase
        .from('evaluations')
        .insert(dbData)
        .select(`
          *,
          employee:colaboradores!evaluations_employee_id_fkey(id, nome, cargo, unidade),
          evaluator:colaboradores!evaluations_evaluator_id_fkey(id, nome)
        `)
        .single();

      if (error) {
        throw error;
      }


      // Mapear dados de volta para o formato do frontend
      const mappedEvaluation: Evaluation = {
        id: insertedData.id,
        employeeId: insertedData.employee_id,
        employee: insertedData.employee?.nome || 'N/A',
        role: insertedData.employee?.cargo || 'N/A',
        type: insertedData.evaluation_type,
        period: this.formatPeriodFromDates(insertedData.evaluation_period_start, insertedData.evaluation_period_end),
        score: insertedData.overall_score || 0,
        status: this.mapEvaluationStatusFromDb(insertedData.status),
        date: insertedData.date,
        evaluatorId: insertedData.evaluator_id,
        evaluator: insertedData.evaluator?.nome,
        comments: insertedData.feedback,
        unit: insertedData.unit,
        // Campos específicos do Coffee Connection
        meetingDate: insertedData.meeting_date,
        meetingTime: insertedData.meeting_time,
        location: insertedData.location,
        topics: insertedData.topics,
        followUpActions: insertedData.follow_up_actions,
        confidential: insertedData.confidential
      };

      return mappedEvaluation;

    } catch (error) {
      throw error;
    }
  },

  async getEvaluations(): Promise<Evaluation[]> {
    try {
      
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          employee:colaboradores!evaluations_employee_id_fkey(id, nome, cargo, unidade),
          evaluator:colaboradores!evaluations_evaluator_id_fkey(id, nome)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }


      if (!data || data.length === 0) {
        return [];
      }

      // Mapear dados para o formato esperado pelo frontend
      const mappedEvaluations: Evaluation[] = data.map(item => ({
        id: item.id,
        employeeId: item.employee_id,
        employee: item.employee?.nome || 'N/A',
        role: item.employee?.cargo || 'N/A',
        type: item.evaluation_type,
        period: this.formatPeriodFromDates(item.evaluation_period_start, item.evaluation_period_end),
        score: item.overall_score || 0,
        status: this.mapEvaluationStatusFromDb(item.status),
        date: item.date,
        evaluatorId: item.evaluator_id,
        evaluator: item.evaluator?.nome,
        comments: item.feedback,
        unit: item.unit,
        // Campos específicos do Coffee Connection
        meetingDate: item.meeting_date,
        meetingTime: item.meeting_time,
        location: item.location,
        topics: item.topics,
        followUpActions: item.follow_up_actions,
        confidential: item.confidential
      }));

      return mappedEvaluations;

    } catch (error) {
      throw error;
    }
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    try {

      // Mapear campos do frontend para o banco
      const dbUpdates: any = {};
      
      if (updates.comments !== undefined) dbUpdates.feedback = updates.comments;
      if (updates.status !== undefined) dbUpdates.status = this.mapEvaluationStatusToDb(updates.status);
      if (updates.score !== undefined) dbUpdates.overall_score = updates.score;
      if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
      
      // Campos específicos do Coffee Connection
      if (updates.meetingDate !== undefined) dbUpdates.meeting_date = updates.meetingDate;
      if (updates.meetingTime !== undefined) dbUpdates.meeting_time = updates.meetingTime;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.topics !== undefined) dbUpdates.topics = updates.topics;
      if (updates.followUpActions !== undefined) dbUpdates.follow_up_actions = updates.followUpActions;
      if (updates.confidential !== undefined) dbUpdates.confidential = updates.confidential;

      const { data, error } = await supabase
        .from('evaluations')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          employee:colaboradores!evaluations_employee_id_fkey(id, nome, cargo, unidade),
          evaluator:colaboradores!evaluations_evaluator_id_fkey(id, nome)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Mapear dados de volta para o formato do frontend
      const mappedEvaluation: Evaluation = {
        id: data.id,
        employeeId: data.employee_id,
        employee: data.employee?.nome || 'N/A',
        role: data.employee?.cargo || 'N/A',
        type: data.evaluation_type,
        period: this.formatPeriodFromDates(data.evaluation_period_start, data.evaluation_period_end),
        score: data.overall_score || 0,
        status: this.mapEvaluationStatusFromDb(data.status),
        date: data.date,
        evaluatorId: data.evaluator_id,
        evaluator: data.evaluator?.nome,
        comments: data.feedback,
        unit: data.unit,
        // Campos específicos do Coffee Connection
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        location: data.location,
        topics: data.topics,
        followUpActions: data.follow_up_actions,
        confidential: data.confidential
      };

      return mappedEvaluation;

    } catch (error) {
      throw error;
    }
  },

  async deleteEvaluation(id: string): Promise<void> {
    try {

      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }


    } catch (error) {
      throw error;
    }
  },

  // Helper functions for evaluation types
  mapEvaluationType(dbType: string): Evaluation['type'] {
    const typeMap: Record<string, Evaluation['type']> = {
      '360_evaluation': 'Avaliação 360°',
      'self_evaluation': 'Auto Avaliação',
      'manager_evaluation': 'Avaliação do Gestor',
      'coffee_connection': 'Coffee Connection'
    };
    return typeMap[dbType] || dbType as Evaluation['type'];
  },

  mapEvaluationTypeToDb(frontendType: Evaluation['type']): string {
    const typeMap: Record<Evaluation['type'], string> = {
      'Avaliação 360°': '360_evaluation',
      'Auto Avaliação': 'self_evaluation',
      'Avaliação do Gestor': 'manager_evaluation',
      'Coffee Connection': 'coffee_connection'
    };
    return typeMap[frontendType] || frontendType;
  }
};
