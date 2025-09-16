import { supabase } from '@/integrations/supabase/client';
import { WhatsAppService } from './whatsappService';

export interface CronJobSchedule {
  id: string;
  name: string;
  schedule: string; // Cron expression
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  handler: () => Promise<void>;
}

export class CronJobService {
  private static jobs: Map<string, CronJobSchedule> = new Map();
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  // Registrar um novo cron job
  static registerJob(job: CronJobSchedule): void {
    this.jobs.set(job.id, job);
    if (job.isActive) {
      this.startJob(job.id);
    }
  }

  // Iniciar um cron job específico
  static startJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Para simplificar, vamos usar intervalos baseados em minutos
    // Em produção, seria melhor usar uma biblioteca como node-cron
    const intervalMs = this.parseScheduleToMs(job.schedule);
    
    const interval = setInterval(async () => {
      try {

        await job.handler();
        job.lastRun = new Date();
        job.nextRun = new Date(Date.now() + intervalMs);
      } catch (error) {
        console.error(`Erro no cron job ${job.name}:`, error);
      }
    }, intervalMs);

    this.intervals.set(jobId, interval);
  }

  // Parar um cron job específico
  static stopJob(jobId: string): void {
    const interval = this.intervals.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(jobId);
    }
  }

  // Parar todos os cron jobs
  static stopAllJobs(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }

  // Converter schedule simples para millisegundos
  private static parseScheduleToMs(schedule: string): number {
    // Formato simples: "5m" = 5 minutos, "1h" = 1 hora, "1d" = 1 dia
    const match = schedule.match(/^(\d+)([mhd])$/);
    if (!match) return 60000; // Default: 1 minuto

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60 * 1000; // minutos
      case 'h': return value * 60 * 60 * 1000; // horas
      case 'd': return value * 24 * 60 * 60 * 1000; // dias
      default: return 60000;
    }
  }

  // Processar agendamentos NPS pendentes
  static async processNPSSchedules(): Promise<void> {
    try {
      const now = new Date();
      
      // Buscar agendamentos ativos que devem ser executados
      const { data: schedules, error } = await supabase
        .from('message_schedules')
        .select(`
          *
        `)
        .eq('type', 'nps')
        .eq('status', 'active')
        .or(`next_execution_at.lte.${now.toISOString()},next_execution_at.is.null`)
        .limit(10);

      if (error) {
        return;
      }

      if (!schedules || schedules.length === 0) {
        return;
      }

      for (const schedule of schedules) {
        await this.processSchedule(schedule);
      }
    } catch (error) {
      console.error('Erro no processamento de agendamentos NPS:', error);
    }
  }

  // Processar um agendamento específico
  private static async processSchedule(schedule: any): Promise<void> {
    try {

      // Buscar usuários alvo
      const targetUsers = await this.getTargetUsers(schedule.target_filters);
      
      if (targetUsers.length === 0) {
        return;
      }

      // Verificar se já existem envios para este agendamento
      const { data: existingSends, error: checkError } = await supabase
        .from('whatsapp_sends')
        .select('id')
        .eq('schedule_id', schedule.id)
        .limit(1);

      if (checkError) {
        return;
      }

      if (existingSends && existingSends.length > 0) {
        return;
      }

      // Extrair survey_id do conteúdo
      const surveyId = schedule.content?.survey_id;
      if (!surveyId) {
        return;
      }

      // Criar envios para cada usuário
      const sends = [];
      for (const user of targetUsers) {
        if (user.phone) {
          // Gerar token único para resposta
          const responseToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          sends.push({
            schedule_id: schedule.id,
            survey_id: surveyId,
            user_id: user.id,
            phone_number: user.phone,
            response_token: responseToken,
            status: 'pending'
          });
        }
      }

      if (sends.length > 0) {
        // Inserir envios na tabela
        const { error: insertError } = await supabase
          .from('whatsapp_sends')
          .insert(sends);

        if (insertError) {
          return;
        }
      }

      // Atualizar agendamento
      await this.updateScheduleAfterExecution(schedule);

    } catch (error) {
      console.error(`Erro ao processar agendamento ${schedule.id}:`, error);
    }
  }

  // Buscar usuários alvo baseado nos critérios
  private static async getTargetUsers(targetUsers: any): Promise<any[]> {
    try {
      if (Array.isArray(targetUsers)) {
        // Se for array de IDs específicos
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, phone, department')
          .in('id', targetUsers)
          .eq('status', 'active');

        if (error) {
          return [];
        }
        return data || [];
      } else if (typeof targetUsers === 'object') {
        // Se for critério de seleção (departamento, cargo, etc.)
        let query = supabase
          .from('users')
          .select('id, full_name, phone, department')
          .eq('status', 'active');

        if (targetUsers.departments) {
          query = query.in('department', targetUsers.departments);
        }

        if (targetUsers.positions) {
          query = query.in('position', targetUsers.positions);
        }

        const { data, error } = await query;
        if (error) {
          return [];
        }
        return data || [];
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários alvo:', error);
      return [];
    }
  }

  // Atualizar agendamento após execução
  private static async updateScheduleAfterExecution(schedule: any): Promise<void> {
    try {
      const now = new Date();
      const updates: any = {
        last_run_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      // Calcular próxima execução baseada no tipo de agendamento
      if (schedule.schedule_type === 'recurring' && schedule.recurrence_pattern) {
        const nextRun = this.calculateNextRun(now, schedule.recurrence_pattern);
        updates.next_run_at = nextRun.toISOString();
      } else if (schedule.schedule_type === 'scheduled') {
        // Agendamento único - marcar como completo
        updates.status = 'completed';
      }

      const { error } = await supabase
        .from('message_schedules')
        .update(updates)
        .eq('id', schedule.id);


    } catch (error) {
      console.error('Erro ao atualizar agendamento após execução:', error);
    }
  }

  // Calcular próxima execução para agendamentos recorrentes
  private static calculateNextRun(lastRun: Date, recurrencePattern: any): Date {
    const nextRun = new Date(lastRun);

    switch (recurrencePattern.type) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + (recurrencePattern.interval || 1));
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + (7 * (recurrencePattern.interval || 1)));
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + (recurrencePattern.interval || 1));
        break;
      case 'quarterly':
        nextRun.setMonth(nextRun.getMonth() + (3 * (recurrencePattern.interval || 1)));
        break;
      case 'yearly':
        nextRun.setFullYear(nextRun.getFullYear() + (recurrencePattern.interval || 1));
        break;
      default:
        nextRun.setDate(nextRun.getDate() + 1); // Default: diário
    }

    return nextRun;
  }

  // Processar envios pendentes de WhatsApp
  static async processPendingWhatsAppSends(): Promise<void> {
    try {
      
      // Buscar envios pendentes
      const { data: sends, error } = await supabase
        .from('whatsapp_sends')
        .select(`
          *,
          nps_surveys(title, question),
          users(full_name)
        `)
        .eq('status', 'pending')
        .limit(50); // Processar em lotes

      if (error) {
        return;
      }

      if (!sends || sends.length === 0) {
        return;
      }

      for (const send of sends) {
        await this.processSingleSend(send);
      }
      

    } catch (error) {
      // Error handling
    }
  }

  // Processar um envio individual
  private static async processSingleSend(send: any): Promise<void> {
    try {
      
      // Marcar como processando
      await supabase
        .from('whatsapp_sends')
        .update({ status: 'processing' })
        .eq('id', send.id);

      // Obter a pergunta da pesquisa
      const surveyQuestion = send.nps_surveys?.question || 'Em uma escala de 0 a 10, o quanto você recomendaria nossa empresa?';
      
      // Gerar URL de resposta
      const baseUrl = import.meta.env.VITE_APP_URL || 'https://la-music-harmonize.vercel.app';
      const responseUrl = `${baseUrl}/whatsapp-nps/response?token=${send.response_token}`;

      // Criar mensagem personalizada
      const message = this.createWhatsAppMessage(send, responseUrl);

      // Enviar via WhatsApp (implementar integração com Evolution API)
      const success = await WhatsAppService.sendMessage(send.phone_number, message);
      
      if (success) {
        // Atualizar status para enviado
        await supabase
          .from('whatsapp_sends')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            response_url: responseUrl
          })
          .eq('id', send.id);


      } else {
        // Marcar como falha e agendar retry se necessário
        const retryCount = (send.retry_count || 0) + 1;
        const maxRetries = send.max_retries || 3;

        if (retryCount <= maxRetries) {
          const nextRetry = new Date();
          nextRetry.setMinutes(nextRetry.getMinutes() + (retryCount * 5)); // Retry exponencial

          await supabase
            .from('whatsapp_sends')
            .update({
              status: 'pending',
              retry_count: retryCount,
              next_retry_at: nextRetry.toISOString(),
              error_message: 'Falha no envio - reagendado para retry'
            })
            .eq('id', send.id);
        } else {
          await supabase
            .from('whatsapp_sends')
            .update({
              status: 'failed',
              error_message: 'Máximo de tentativas excedido'
            })
            .eq('id', send.id);
        }
      }
    } catch (error) {
      console.error(`Erro ao processar envio ${send.id}:`, error);
      
      // Marcar como falha
      await supabase
        .from('whatsapp_sends')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        .eq('id', send.id);
    }
  }

  // Criar mensagem personalizada para WhatsApp
  private static createWhatsAppMessage(send: any, responseUrl: string): string {
    const userName = send.users?.full_name || 'Colaborador';
    const surveyTitle = send.nps_surveys?.title || 'Pesquisa de Satisfação';
    
    return (
      `Olá ${userName}! 👋\n\n` +
      `Gostaríamos de saber sua opinião sobre nossos serviços.\n\n` +
      `📊 *${surveyTitle}*\n\n` +
      `Clique no link para responder:\n${responseUrl}\n\n` +
      `_Sua opinião é muito importante para nós!_`
    );
  }

  // Inicializar cron jobs do sistema
  static initializeSystemJobs(): void {
    // Job para processar agendamentos NPS (executa a cada 5 minutos)
    this.registerJob({
      id: 'nps-schedules-processor',
      name: 'Processador de Agendamentos NPS',
      schedule: '5m',
      isActive: true,
      handler: () => this.processNPSSchedules()
    });

    // Job para processar envios WhatsApp pendentes (executa a cada 2 minutos)
    this.registerJob({
      id: 'whatsapp-sends-processor',
      name: 'Processador de Envios WhatsApp',
      schedule: '2m',
      isActive: true,
      handler: () => this.processPendingWhatsAppSends()
    });


  }

  // Obter status de todos os jobs
  static getJobsStatus(): CronJobSchedule[] {
    return Array.from(this.jobs.values());
  }
}