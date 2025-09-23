
export interface Evaluation {
  id: string;
  employeeId: string;
  employee: string;
  role: string;
  type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor' | 'Coffee Connection';
  period: string;
  score: number;
  status: 'Concluída' | 'Em Andamento';
  date: string;
  evaluatorId?: string;
  evaluator?: string;
  comments?: string;
  unit?: string;
  // Campos específicos do Coffee Connection
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  topics?: string[];
  followUpActions?: string;
  confidential?: boolean;
}

export interface NewEvaluationData {
  employee_id: string;
  evaluation_type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor' | 'Coffee Connection';
  evaluation_date: string;
  period: string;
  evaluator_id?: string | null;
  comments?: string;
  unit: string;
  // Campos específicos do Coffee Connection
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  topics?: string[];
  followUpActions?: string;
  confidential?: boolean;
}
