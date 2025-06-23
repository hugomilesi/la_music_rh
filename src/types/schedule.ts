
import { Unit } from './unit';

export interface ScheduleEvent {
  id: string;
  title: string;
  employeeId: string;
  employee: string;
  unit: Unit; // Changed to use Unit enum
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description?: string;
  location?: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewScheduleEventData {
  title: string;
  employeeId: string;
  unit: Unit; // Changed to use Unit enum
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description?: string;
  location?: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
}
