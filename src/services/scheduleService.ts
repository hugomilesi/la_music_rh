
import { supabase } from '@/integrations/supabase/client';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';

export const scheduleService = {
  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    try {
      console.log('🔄 ScheduleService: Buscando eventos da agenda...');
      
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          users!schedule_events_employee_id_fkey(username)
        `)
        .order('event_date', { ascending: false });
      
      if (error) {
        console.error('❌ ScheduleService: Erro ao buscar eventos da agenda:', error);
        throw error;
      }
      
      console.log('✅ ScheduleService: Eventos da agenda encontrados:', data?.length || 0);
      
      return data?.map(event => ({
        id: event.id,
        title: event.title,
        employee_id: event.employee_id,
        employeeId: event.employee_id,
        employee: event.users?.username || 'Unknown',
        unit: event.unit as Unit,
        date: event.event_date,
        event_date: event.event_date,
        start_time: event.start_time,
        startTime: event.start_time,
        end_time: event.end_time,
        endTime: event.end_time,
        type: event.type as ScheduleEvent['type'],
        description: event.description,
        location: event.location,
        email_alert: event.email_alert || false,
        emailAlert: event.email_alert || false,
        whatsapp_alert: event.whatsapp_alert || false,
        whatsappAlert: event.whatsapp_alert || false,
        created_at: event.created_at,
        createdAt: event.created_at,
        updated_at: event.updated_at,
        updatedAt: event.updated_at
      })) || [];
    } catch (error) {
      console.error('❌ ScheduleService: Erro ao buscar eventos da agenda:', error);
      throw error;
    }
  },

  async createScheduleEvent(eventData: NewScheduleEventData): Promise<ScheduleEvent> {
    try {
      console.log('🔄 ScheduleService: Criando evento da agenda:', eventData);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .insert([{
          title: eventData.title,
          employee_id: eventData.employeeId,
          unit: eventData.unit,
          event_date: eventData.date,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          type: eventData.type,
          description: eventData.description,
          location: eventData.location,
          email_alert: eventData.emailAlert,
          whatsapp_alert: eventData.whatsappAlert
        }])
        .select(`
          *,
          users!schedule_events_employee_id_fkey(username)
        `)
        .single();
      
      if (error) {
        console.error('❌ ScheduleService: Erro ao criar evento da agenda:', error);
        throw error;
      }
      
      console.log('✅ ScheduleService: Evento da agenda criado com sucesso:', data.id);
      
      return {
        id: data.id,
        title: data.title,
        employee_id: data.employee_id,
        employeeId: data.employee_id,
        employee: data.users?.username || 'Unknown',
        unit: data.unit as Unit,
        date: data.event_date,
        event_date: data.event_date,
        start_time: data.start_time,
        startTime: data.start_time,
        end_time: data.end_time,
        endTime: data.end_time,
        type: data.type as ScheduleEvent['type'],
        description: data.description,
        location: data.location,
        email_alert: data.email_alert || false,
        emailAlert: data.email_alert || false,
        whatsapp_alert: data.whatsapp_alert || false,
        whatsappAlert: data.whatsapp_alert || false,
        created_at: data.created_at,
        createdAt: data.created_at,
        updated_at: data.updated_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in createScheduleEvent:', error);
      throw error;
    }
  },

  async updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
    try {
      console.log('🔄 ScheduleService: Atualizando evento de agenda:', { id, updates });
      
      const { data, error } = await supabase
        .from('schedule_events')
        .update({
          title: updates.title,
          employee_id: updates.employeeId || updates.employee_id,
          unit: updates.unit,
          event_date: updates.date || updates.event_date,
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
          users!schedule_events_employee_id_fkey(username)
        `)
        .single();
      
      if (error) {
        console.error('❌ ScheduleService: Erro ao atualizar evento:', error);
        throw error;
      }
      
      console.log('✅ ScheduleService: Evento atualizado com sucesso:', data.id);
      
      return {
        id: data.id,
        title: data.title,
        employee_id: data.employee_id,
        employeeId: data.employee_id, // alias
        employee: data.users?.username || 'Unknown',
        unit: data.unit as Unit,
        date: data.event_date, // alias
        event_date: data.event_date,
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
      console.error('❌ ScheduleService: Erro ao atualizar evento:', error);
      throw error;
    }
  },

  async deleteScheduleEvent(id: string): Promise<void> {
    try {
      console.log('🔄 ScheduleService: Deletando evento de agenda:', id);
      
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ ScheduleService: Erro ao deletar evento:', error);
        throw error;
      }
      
      console.log('✅ ScheduleService: Evento deletado com sucesso:', id);
    } catch (error) {
      console.error('❌ ScheduleService: Erro ao deletar evento:', error);
      throw error;
    }
  },

  async getEventsForUnits(units: Unit[]): Promise<ScheduleEvent[]> {
    try {
      console.log('🔄 ScheduleService: Buscando eventos para unidades:', units);
      
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          users!schedule_events_employee_id_fkey(username)
        `)
        .in('unit', units)
        .order('event_date', { ascending: false });
      
      if (error) {
        console.error('❌ ScheduleService: Erro ao buscar eventos por unidades:', error);
        throw error;
      }
      
      console.log('✅ ScheduleService: Eventos encontrados:', data?.length || 0);
      
      return data?.map(event => ({
        id: event.id,
        title: event.title,
        employee_id: event.employee_id,
        employeeId: event.employee_id, // alias
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
      console.error('❌ ScheduleService: Erro ao buscar eventos por unidades:', error);
      throw error;
    }
  }
};
