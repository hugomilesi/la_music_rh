
import { ScheduleUnit } from './unit';

export interface EventFormData {
  title: string;
  employeeId: string;
  unit: ScheduleUnit;
  type: 'meeting' | 'appointment' | 'reminder' | 'task' | 'vacation' | 'training';
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  emailAlert?: boolean;
  whatsappAlert?: boolean;
}

export interface NewScheduleEventData {
  title: string;
  employeeId: string;
  unit: ScheduleUnit;
  type: 'meeting' | 'appointment' | 'reminder' | 'task' | 'vacation' | 'training';
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  emailAlert?: boolean;
  whatsappAlert?: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  employee_id: string;
  employeeId: string; // alias for compatibility
  employee: string; // employee name
  unit: ScheduleUnit;
  type: 'meeting' | 'appointment' | 'reminder' | 'task' | 'vacation' | 'training';
  event_date: string;
  date: string; // alias for compatibility
  start_time: string;
  startTime: string; // alias for compatibility
  end_time: string;
  endTime: string; // alias for compatibility
  description?: string;
  location?: string;
  email_alert?: boolean;
  emailAlert?: boolean; // alias for compatibility
  whatsapp_alert?: boolean;
  whatsappAlert?: boolean; // alias for compatibility
  created_at: string;
  createdAt: string; // alias for compatibility
  updated_at: string;
  updatedAt: string; // alias for compatibility
  status?: string;
  // Campos para controle de avaliações
  is_evaluation?: boolean;
  is_removable_disabled?: boolean;
  evaluation_id?: string;
}

export interface TimeSlot {
  time: string;
  events: ScheduleEvent[];
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
}
