
import { Unit } from '@/types/unit';

export interface EventFormData {
  title: string;
  employeeId: string;
  unit: Unit;
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description: string;
  location: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
}
