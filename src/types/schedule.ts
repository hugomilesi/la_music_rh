
import { Unit } from './unit';

export interface EventFormData {
  title: string;
  employeeId: string;
  unit: Unit;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
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
  unit: string;
  type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  location?: string;
  email_alert?: boolean;
  whatsapp_alert?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  events: ScheduleEvent[];
}

export interface DaySchedule {
  date: string;
  timeSlots: TimeSlot[];
}
