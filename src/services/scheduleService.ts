
import { supabase } from '@/integrations/supabase/client';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit, ScheduleUnit } from '@/types/unit';

export const scheduleService = {
  async getScheduleEventsWithEvaluations(): Promise<ScheduleEvent[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_events_with_evaluations')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data?.map(event => {
        // Converter timestamps para formato esperado pelo frontend
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        
        // Extrair data no formato YYYY-MM-DD
        const dateStr = startDate.toISOString().split('T')[0];
        
        // Extrair horários no formato HH:MM
        const startTime = startDate.toTimeString().slice(0, 5);
        const endTime = endDate.toTimeString().slice(0, 5);
        
        console.log('📅 Mapeando evento da VIEW:', {
          id: event.id,
          title: event.title,
          is_evaluation: event.is_evaluation,
          is_removable_disabled: event.is_removable_disabled,
          start_date: event.start_date,
          end_date: event.end_date,
          dateStr,
          startTime,
          endTime
        });
        
        return {
          id: event.id,
          title: event.title,
          employee_id: event.user_id,
          employeeId: event.user_id,
          employee: 'Unknown', // Será resolvido pelo frontend se necessário
          unit: (event.unit || 'campo-grande') as ScheduleUnit,
          date: dateStr,
          event_date: dateStr,
          start_time: startTime,
          startTime: startTime,
          end_time: endTime,
          endTime: endTime,
          type: (event.event_type || 'appointment') as ScheduleEvent['type'],
          description: event.description,
          location: event.location,
          email_alert: false,
          emailAlert: false,
          whatsapp_alert: false,
          whatsappAlert: false,
          created_at: event.created_at,
          createdAt: event.created_at,
          updated_at: event.updated_at,
          updatedAt: event.updated_at,
          status: event.status,
          // Campos específicos para controle de remoção
          is_evaluation: event.is_evaluation,
          is_removable_disabled: event.is_removable_disabled,
          evaluation_id: event.evaluation_id
        };
      }) || [];
    } catch (error) {
      console.error('❌ Erro ao carregar eventos da VIEW:', error);
      throw error;
    }
  },

  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          users(username)
        `)
        .order('start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data?.map(event => {
        // Converter timestamps para formato esperado pelo frontend
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        
        // Extrair data no formato YYYY-MM-DD
        const dateStr = startDate.toISOString().split('T')[0];
        
        // Extrair horários no formato HH:MM
        const startTime = startDate.toTimeString().slice(0, 5);
        const endTime = endDate.toTimeString().slice(0, 5);
        
        console.log('📅 Mapeando evento:', {
          id: event.id,
          title: event.title,
          start_date: event.start_date,
          end_date: event.end_date,
          dateStr,
          startTime,
          endTime
        });
        
        return {
          id: event.id,
          title: event.title,
          employee_id: event.user_id,
          employeeId: event.user_id,
          employee: event.users?.username || 'Unknown',
          unit: (event.unit || 'campo-grande') as ScheduleUnit,
          date: dateStr,
          event_date: dateStr,
          start_time: startTime,
          startTime: startTime,
          end_time: endTime,
          endTime: endTime,
          type: (event.event_type || event.type || 'appointment') as ScheduleEvent['type'],
          description: event.description,
          location: event.location,
          email_alert: event.email_alert || false,
          emailAlert: event.email_alert || false,
          whatsapp_alert: event.whatsapp_alert || false,
          whatsappAlert: event.whatsapp_alert || false,
          created_at: event.created_at,
          createdAt: event.created_at,
          updated_at: event.updated_at,
          updatedAt: event.updated_at,
          status: event.status
        };
      }) || [];
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      throw error;
    }
  },

  async createScheduleEvent(eventData: NewScheduleEventData): Promise<ScheduleEvent> {
    try {
      console.log('📝 Criando evento com dados:', eventData);
      
      // Converter data e horários para timestamp
      const startDateTime = new Date(`${eventData.date}T${eventData.startTime}:00`);
      const endDateTime = new Date(`${eventData.date}T${eventData.endTime}:00`);
      
      console.log('🕐 Timestamps convertidos:', {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString()
      });
      
      const { data, error } = await supabase
        .from('schedule_events')
        .insert({
          title: eventData.title,
          user_id: eventData.employeeId,
          unit: eventData.unit,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          event_type: eventData.type,
          description: eventData.description,
          location: eventData.location,
          status: 'scheduled'
        })
        .select(`
          *,
          users(username)
        `)
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar evento:', error);
        throw error;
      }
      
      console.log('✅ Evento criado com sucesso:', data);
      
      // Mapear resposta para formato do frontend
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      return {
        id: data.id,
        title: data.title,
        employee_id: data.user_id,
        employeeId: data.user_id,
        employee: data.users?.username || 'Unknown',
        unit: (data.unit || 'campo-grande') as ScheduleUnit,
        date: startDate.toISOString().split('T')[0],
        event_date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        startTime: startDate.toTimeString().slice(0, 5),
        end_time: endDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        type: (data.event_type || data.type || 'appointment') as ScheduleEvent['type'],
        description: data.description,
        location: data.location,
        email_alert: data.email_alert || false,
        emailAlert: data.email_alert || false,
        whatsapp_alert: data.whatsapp_alert || false,
        whatsappAlert: data.whatsapp_alert || false,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at,
        status: data.status
      };
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      throw error;
    }
  },

  async updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .update({
          title: updates.title,
          user_id: updates.employeeId || updates.employee_id,
          unit: updates.unit,
          start_date: updates.date || updates.event_date,
          end_date: updates.endTime ? new Date((updates.date || updates.event_date) + 'T' + (updates.endTime || updates.end_time)).toISOString() : null,
          start_time: updates.startTime || updates.start_time,
          end_time: updates.endTime || updates.end_time,
          type: updates.type,
          description: updates.description,
          location: updates.location,
          email_alert: updates.emailAlert ?? updates.email_alert,
          whatsapp_alert: updates.whatsappAlert ?? updates.whatsapp_alert
        })
        .eq('id', id)
        .select(`
          *,
          users(username)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        title: data.title,
        employee_id: data.user_id,
        employeeId: data.user_id, // alias
        employee: data.users?.username || 'Unknown',
        unit: data.unit as Unit,
        date: data.start_date, // alias
        event_date: data.start_date,
        start_time: data.start_time,
        startTime: data.start_time, // alias
        end_time: data.end_time,
        endTime: data.end_time, // alias
        type: data.type as ScheduleEvent['type'],
        description: data.description,
        location: data.location,
        email_alert: data.email_alert || false,
        emailAlert: data.email_alert || false, // alias
        whatsapp_alert: data.whatsapp_alert || false,
        whatsappAlert: data.whatsapp_alert || false, // alias
        created_at: data.created_at,
        createdAt: data.created_at, // alias
        updated_at: data.updated_at,
        updatedAt: data.updated_at // alias
      };
    } catch (error) {
      throw error;
    }
  },

  async deleteScheduleEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  async getEventsForUnits(units: Unit[]): Promise<ScheduleEvent[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          users!schedule_events_employee_id_fkey(username)
        `)
        .in('unit', units)
        .order('event_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data?.map(event => ({
        id: event.id,
        title: event.title,
        employee_id: event.user_id,
        employeeId: event.user_id, // alias
        employee: event.users?.username || 'Unknown',
        unit: event.unit as Unit,
        date: event.event_date, // alias
        event_date: event.event_date,
        start_time: event.start_time,
        startTime: event.start_time, // alias
        end_time: event.end_time,
        endTime: event.end_time, // alias
        type: event.type as ScheduleEvent['type'],
        description: event.description,
        location: event.location,
        email_alert: event.email_alert || false,
        emailAlert: event.email_alert || false, // alias
        whatsapp_alert: event.whatsapp_alert || false,
        whatsappAlert: event.whatsapp_alert || false, // alias
        created_at: event.created_at,
        createdAt: event.created_at, // alias
        updated_at: event.updated_at,
        updatedAt: event.updated_at // alias
      })) || [];
    } catch (error) {
      throw error;
    }
  }
};
