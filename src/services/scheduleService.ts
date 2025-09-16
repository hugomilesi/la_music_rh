
import { supabase } from '@/integrations/supabase/client';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';

export const scheduleService = {
  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    const { data, error } = await supabase
      .from('schedule_events')
      .select(`
        *,
        users(full_name)
      `)
      .order('event_date', { ascending: false });
    
    if (error) {
      // Error fetching events logging disabled
      throw error;
    }
    
    return data?.map(event => ({
      id: event.id,
      title: event.title,
      employee_id: event.employee_id,
      employeeId: event.employee_id, // alias
      employee: event.users?.full_name || 'Unknown',
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
  },

  async createScheduleEvent(eventData: NewScheduleEventData): Promise<ScheduleEvent> {
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
        users(full_name)
      `)
      .single();
    
    if (error) {
      // Error creating event logging disabled
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      employee_id: data.employee_id,
      employeeId: data.employee_id, // alias
      employee: data.users?.full_name || 'Unknown',
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
  },

  async updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
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
        users(full_name)
      `)
      .single();
    
    if (error) {
      // Error updating event logging disabled
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      employee_id: data.employee_id,
      employeeId: data.employee_id, // alias
      employee: data.users?.full_name || 'Unknown',
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
  },

  async deleteScheduleEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      // Error deleting event logging disabled
      throw error;
    }
  },

  async getEventsForUnits(units: Unit[]): Promise<ScheduleEvent[]> {
    const { data, error } = await supabase
      .from('schedule_events')
      .select(`
        *,
        users(full_name)
      `)
      .in('unit', units)
      .order('event_date', { ascending: false });
    
    if (error) {
      // Error fetching events logging disabled
      throw error;
    }
    
    return data?.map(event => ({
      id: event.id,
      title: event.title,
      employee_id: event.employee_id,
      employeeId: event.employee_id, // alias
      employee: event.users?.full_name || 'Unknown',
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
  }
};
