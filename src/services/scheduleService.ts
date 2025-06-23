
import { supabase } from '@/integrations/supabase/client';
import { ScheduleEvent, NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';

export const scheduleService = {
  async getScheduleEvents(): Promise<ScheduleEvent[]> {
    const { data, error } = await supabase
      .from('schedule_events')
      .select(`
        *,
        employee:employees!schedule_events_employee_id_fkey(name)
      `)
      .order('event_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching schedule events:', error);
      throw error;
    }
    
    return data?.map(event => ({
      id: event.id,
      title: event.title,
      employeeId: event.employee_id,
      employee: event.employee?.name || 'Unknown',
      unit: event.unit as Unit,
      date: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      type: event.type as ScheduleEvent['type'],
      description: event.description,
      location: event.location,
      emailAlert: event.email_alert || false,
      whatsappAlert: event.whatsapp_alert || false,
      createdAt: event.created_at,
      updatedAt: event.updated_at
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
        employee:employees!schedule_events_employee_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating schedule event:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      employeeId: data.employee_id,
      employee: data.employee?.name || 'Unknown',
      unit: data.unit as Unit,
      date: data.event_date,
      startTime: data.start_time,
      endTime: data.end_time,
      type: data.type as ScheduleEvent['type'],
      description: data.description,
      location: data.location,
      emailAlert: data.email_alert || false,
      whatsappAlert: data.whatsapp_alert || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateScheduleEvent(id: string, updates: Partial<ScheduleEvent>): Promise<ScheduleEvent> {
    const { data, error } = await supabase
      .from('schedule_events')
      .update({
        title: updates.title,
        employee_id: updates.employeeId,
        unit: updates.unit,
        event_date: updates.date,
        start_time: updates.startTime,
        end_time: updates.endTime,
        type: updates.type,
        description: updates.description,
        location: updates.location,
        email_alert: updates.emailAlert,
        whatsapp_alert: updates.whatsappAlert
      })
      .eq('id', id)
      .select(`
        *,
        employee:employees!schedule_events_employee_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating schedule event:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      employeeId: data.employee_id,
      employee: data.employee?.name || 'Unknown',
      unit: data.unit as Unit,
      date: data.event_date,
      startTime: data.start_time,
      endTime: data.end_time,
      type: data.type as ScheduleEvent['type'],
      description: data.description,
      location: data.location,
      emailAlert: data.email_alert || false,
      whatsappAlert: data.whatsapp_alert || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteScheduleEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting schedule event:', error);
      throw error;
    }
  },

  async getEventsForUnits(units: Unit[]): Promise<ScheduleEvent[]> {
    const { data, error } = await supabase
      .from('schedule_events')
      .select(`
        *,
        employee:employees!schedule_events_employee_id_fkey(name)
      `)
      .in('unit', units)
      .order('event_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching events for units:', error);
      throw error;
    }
    
    return data?.map(event => ({
      id: event.id,
      title: event.title,
      employeeId: event.employee_id,
      employee: event.employee?.name || 'Unknown',
      unit: event.unit as Unit,
      date: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      type: event.type as ScheduleEvent['type'],
      description: event.description,
      location: event.location,
      emailAlert: event.email_alert || false,
      whatsappAlert: event.whatsapp_alert || false,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    })) || [];
  }
};
