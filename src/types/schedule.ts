
import { Unit } from '@/types/unit';

export interface ScheduleEvent {
  id: string;
  title: string;
  employeeId: string;
  employee: string;
  unit: Unit;
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
  unit: Unit;
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description?: string;
  location?: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
}
