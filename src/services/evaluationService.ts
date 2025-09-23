
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

  formatPeriodFromDates(startDate: string, endDate: string): string {
    // Garantir que as datas estão no formato correto
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const year = start.getFullYear();
    
    // Determinar o trimestre baseado nas datas de início e fim
    const startMonth = start.getMonth() + 1; // getMonth() retorna 0-11
    const endMonth = end.getMonth() + 1;
    
    console.log('🔍 formatPeriodFromDates DEBUG:', {
      startDate,
      endDate,
      startDateParsed: start.toISOString(),
      endDateParsed: end.toISOString(),
      startMonth,
      endMonth,
      year
    });
    
    // Verificar se é um período anual completo (janeiro a dezembro)
    if (startMonth === 1 && endMonth === 12) {
      console.log('✅ Identificado como Anual');
      return `${year} - Anual`;
    }
    
    // Verificar trimestres baseado apenas nos meses
    if (startMonth === 1 && endMonth === 3) {
      console.log('✅ Identificado como 1º Trimestre');
      return `${year} - 1º Trimestre`;
    } else if (startMonth === 4 && endMonth === 6) {
      console.log('✅ Identificado como 2º Trimestre');
      return `${year} - 2º Trimestre`;
    } else if (startMonth === 7 && endMonth === 9) {
      console.log('✅ Identificado como 3º Trimestre');
      return `${year} - 3º Trimestre`;
    } else if (startMonth === 10 && endMonth === 12) {
      console.log('✅ Identificado como 4º Trimestre');
      return `${year} - 4º Trimestre`;
    }
    
    // Fallback para períodos customizados
    console.log('❌ Nenhum trimestre padrão encontrado:', { startMonth, endMonth });
    return `${year} - Período Customizado`;
  },

  mapEvaluationStatusToDb(frontendStatus: string): string {
    const statusMap: Record<string, string> = {
      'Rascunho': 'draft',
      'Em Andamento': 'submitted',
      'Em Análise': 'reviewed',
      'Concluída': 'finalized',
      'concluida': 'finalized' // Legacy support
    };
    return statusMap[frontendStatus] || 'draft';
  },
  async getEvaluations(): Promise<Evaluation[]> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          employee:users!employee_id(username),
          evaluator:users!evaluator_id(username)
        `)
        .order('date', { ascending: false }); // Banco usa 'date' não 'meeting_date'

      if (error) {
        throw error;
      }

      return data.map(evaluation => ({
        id: evaluation.id,
        employeeId: evaluation.employee_id,
        employee: evaluation.employee?.username || 'Unknown',
        evaluatorId: evaluation.evaluator_id,
        evaluator: evaluation.evaluator?.username || 'Unknown',
        type: this.mapEvaluationType(evaluation.evaluation_type),
        period: this.formatPeriodFromDates(evaluation.evaluation_period_start, evaluation.evaluation_period_end),
        status: this.mapEvaluationStatusFromDb(evaluation.status),
        score: evaluation.overall_score || 0,
        date: evaluation.date, // Banco usa 'date'
        unit: evaluation.unit,
        meetingDate: evaluation.meeting_date, // Fallback para compatibilidade
        meetingTime: evaluation.meeting_time,
        comments: evaluation.feedback || evaluation.comments,
        location: evaluation.location,
        topics: evaluation.topics || [],
        followUpActions: evaluation.follow_up_actions,
        confidential: evaluation.confidential || false,
        evaluationPeriodStart: evaluation.evaluation_period_start,
        evaluationPeriodEnd: evaluation.evaluation_period_end,
        evaluationType: this.mapEvaluationType(evaluation.evaluation_type),
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

  // Helper para adicionar uma hora ao horário
  addOneHour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  },

  async createEvaluation(evaluationData: NewEvaluationData): Promise<Evaluation> {
    try {
      console.log('🔄 EvaluationService: Criando avaliação com dados:', evaluationData);
      
      // Map frontend data to database format
      const today = new Date().toISOString().split('T')[0];
      
      // Parse evaluation_date to get start and end dates for the quarter
      let periodStart = today;
      let periodEnd = today;
      
      if (evaluationData.evaluation_date) {
        const evaluationDate = new Date(evaluationData.evaluation_date);
        const year = evaluationDate.getFullYear();
        const month = evaluationDate.getMonth() + 1; // getMonth() retorna 0-11
        
        // Determinar o trimestre baseado no mês da data selecionada
        if (month >= 1 && month <= 3) {
          periodStart = `${year}-01-01`;
          periodEnd = `${year}-03-31`;
        } else if (month >= 4 && month <= 6) {
          periodStart = `${year}-04-01`;
          periodEnd = `${year}-06-30`;
        } else if (month >= 7 && month <= 9) {
          periodStart = `${year}-07-01`;
          periodEnd = `${year}-09-30`;
        } else if (month >= 10 && month <= 12) {
          periodStart = `${year}-10-01`;
          periodEnd = `${year}-12-31`;
        }
      }
      
      const dbData = {
        employee_id: evaluationData.employee_id,
        evaluator_id: evaluationData.evaluator_id || evaluationData.employee_id, // Se não há avaliador, usa o próprio funcionário
        evaluation_period_start: periodStart,
        evaluation_period_end: periodEnd,
        overall_score: null,
        feedback: evaluationData.comments || null,
        development_plan: null,
        status: 'submitted', // Criar como 'Em Andamento' em vez de 'draft'
        date: evaluationData.evaluation_date || today,
        evaluation_type: this.mapEvaluationTypeToDb(evaluationData.evaluation_type),
        unit: evaluationData.unit,
        // Campos específicos do Coffee Connection
        meeting_time: evaluationData.meetingTime || null,
        location: evaluationData.location || null,
        topics: evaluationData.topics || null,
        follow_up_actions: evaluationData.followUpActions || null,
        confidential: evaluationData.confidential || false
      };
      
      console.log('📝 EvaluationService: Dados mapeados para o banco:', dbData);

      const { data, error } = await supabase
        .from('evaluations')
        .insert(dbData)
        .select(`
          id,
          employee_id,
          evaluator_id,
          evaluation_period_start,
          evaluation_period_end,
          overall_score,
          feedback,
          development_plan,
          status,
          date,
          evaluation_type,
          unit,
          meeting_time,
          location,
          topics,
          follow_up_actions,
          confidential,
          created_at,
          updated_at,
          employee:users!employee_id(username),
          evaluator:users!evaluator_id(username)
        `)
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ EvaluationService: Avaliação criada no banco:', data);

      // Criar evento na agenda para todas as avaliações (não apenas Coffee Connection)
      try {
        console.log('📅 Criando evento na agenda para avaliação...');
        
        // Importar o scheduleService dinamicamente para evitar dependência circular
        const { scheduleService } = await import('./scheduleService');
        
        // Para Coffee Connection, usar dados específicos
        if (evaluationData.evaluation_type === 'Coffee Connection' && evaluationData.meetingDate && evaluationData.meetingTime) {
          const scheduleEventData = {
            title: `Coffee Connection - ${data.employee?.username || 'Colaborador'}`,
            employeeId: data.employee_id,
            unit: data.unit,
            date: evaluationData.meetingDate,
            startTime: evaluationData.meetingTime,
            endTime: this.addOneHour(evaluationData.meetingTime), // Adiciona 1 hora
            type: 'appointment' as const,
            description: `Coffee Connection com ${data.employee?.username || 'Colaborador'}`,
            location: evaluationData.location || '',
            emailAlert: false,
            whatsappAlert: false
          };
          
          console.log('📝 Dados do evento na agenda (Coffee Connection):', scheduleEventData);
          await scheduleService.createScheduleEvent(scheduleEventData);
        } else {
          // Para avaliações normais, criar evento genérico
          const scheduleEventData = {
            title: `${evaluationData.evaluation_type} - ${data.employee?.username || 'Colaborador'}`,
            employeeId: data.employee_id,
            unit: data.unit,
            date: evaluationData.evaluation_date || new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            type: 'appointment' as const,
            description: `${evaluationData.evaluation_type} com ${data.employee?.username || 'Colaborador'}`,
            location: '',
            emailAlert: false,
            whatsappAlert: false
          };
          
          console.log('📝 Dados do evento na agenda (Avaliação Normal):', scheduleEventData);
          await scheduleService.createScheduleEvent(scheduleEventData);
        }
        
        console.log('✅ Evento criado na agenda com sucesso');
      } catch (scheduleError) {
        console.error('❌ Erro ao criar evento na agenda:', scheduleError);
        // Não falha a criação da avaliação se houver erro na agenda
      }

      return {
        id: data.id,
        employeeId: data.employee_id,
        employee: data.employee?.username || 'Unknown',
        evaluatorId: data.evaluator_id,
        evaluator: data.evaluator?.username || 'Unknown',
        type: this.mapEvaluationType(data.evaluation_type),
        period: this.formatPeriodFromDates(data.evaluation_period_start, data.evaluation_period_end),
        status: this.mapEvaluationStatusFromDb(data.status),
        score: data.overall_score || 0,
        date: data.date,
        unit: data.unit,
        meetingDate: evaluationData.meetingDate,
        meetingTime: data.meeting_time,
        comments: data.feedback,
        location: data.location,
        topics: data.topics || [],
        followUpActions: data.follow_up_actions,
        confidential: data.confidential || false,
        evaluationPeriodStart: data.evaluation_period_start,
        evaluationPeriodEnd: data.evaluation_period_end,
        evaluationType: this.mapEvaluationType(data.evaluation_type),
        overallScore: data.overall_score,
        competenciesScore: null,
        goalsAchievement: null,
        strengths: '',
        areasForImprovement: '',
        developmentPlan: data.development_plan || '',
        evaluatorComments: '',
        hrComments: '',
        nextReviewDate: null,
        completedAt: null,
        approvedAt: null,
        approvedBy: null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw error;
    }
  },

  async updateEvaluation(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    try {
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
        } else if (key === 'score') {
          // Map score to overall_score in database
          dbUpdates.overall_score = value;
        } else if (key === 'comments') {
          // Map comments to feedback in database
          dbUpdates.feedback = value;
        } else if (fieldMapping[key]) {
          // Only add non-empty values for mapped fields
          if (value !== '' && value !== null && value !== undefined) {
            dbUpdates[fieldMapping[key]] = value;
          }
        } else {
          // Fields that don't need mapping (location, topics, confidential, etc.)
          // Only add non-empty values
          if (value !== '' && value !== null && value !== undefined) {
            dbUpdates[key] = value;
          }
        }
      });
      
      // Automatically set status to completed and update date when score is provided
      if (isScoreUpdate) {
        dbUpdates.status = 'finalized';
        dbUpdates.date = new Date().toISOString().split('T')[0];
      }
        
      const { data, error } = await supabase
        .from('evaluations')
        .update(dbUpdates)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(id, username),
          evaluator:users!evaluator_id(id, username)
        `)
        .single();
      
      if (error) {
        throw error;
      }

      // Get employee and evaluator information separately
      const { data: employeeData } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.employee_id)
        .single();

      const { data: evaluatorData } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.evaluator_id)
        .single();

      return {
        id: data.id,
        employeeId: data.employee_id,
        employee: employeeData?.username || 'Unknown',
        role: 'N/A', // Não temos position no select
        evaluator: evaluatorData?.username || 'Unknown',
        evaluatorId: data.evaluator_id,
        type: 'Avaliação 360°', // Valor padrão já que não temos mais o campo evaluation_type
        period: data.period || 'N/A',
        status: this.mapEvaluationStatusFromDb(data.status),
        score: data.overall_score || 0,
        date: data.date,
        comments: data.feedback || data.comments,
        unit: data.unit,
        location: data.location,
        topics: data.topics || [],
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        followUpActions: data.follow_up_actions,
        confidential: data.confidential,
        evaluationPeriodStart: data.evaluation_period_start,
        evaluationPeriodEnd: data.evaluation_period_end,
        evaluationType: 'Avaliação 360°', // Valor padrão já que não temos mais o campo evaluation_type
        overallScore: data.overall_score,
        competenciesScore: data.competencies_score,
        goalsAchievement: data.goals_achievement,
        strengths: data.strengths,
        areasForImprovement: data.areas_for_improvement,
        developmentPlan: data.development_plan,
        evaluatorComments: data.evaluator_comments,
        hrComments: data.hr_comments,
        nextReviewDate: data.next_review_date,
        completedAt: data.completed_at,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
    return this.mapEvaluationStatusFromDb(dbStatus) as Evaluation['status'];
  },

  mapEvaluationStatusToDb(frontendStatus: Evaluation['status']): string {
    const statusMap: Record<Evaluation['status'], string> = {
      'Em Andamento': 'submitted',
      'Concluída': 'finalized'
    };
    return statusMap[frontendStatus] || 'draft';
  },


};
