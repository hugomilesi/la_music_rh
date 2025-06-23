
export type MedicalUnit = 'uti_neonatal' | 'uti_pediatrica' | 'emergencia_pediatrica' | 'internacao' | 'ambulatorio';

export interface ScheduleEvent {
  id: string;
  title: string;
  employeeId: string;
  employee: string;
  unit: MedicalUnit;
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
  unit: MedicalUnit;
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description?: string;
  location?: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
}
