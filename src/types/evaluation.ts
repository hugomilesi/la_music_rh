
export interface Evaluation {
  id: string;
  employeeId: string;
  employee: string;
  role: string;
  unit: string;
  type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor' | 'Coffee Connection';
  period: string;
  score: number;
  status: 'Concluída' | 'Pendente' | 'Em Andamento';
  date: string;
  evaluatorId?: string;
  evaluator?: string;
  comments?: string;
  // Campos específicos do Coffee Connection
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  topics?: string[];
  followUpActions?: string;
  confidential?: boolean;
}

export interface NewEvaluationData {
  employeeId: string;
  type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor' | 'Coffee Connection';
  period: string;
  evaluatorId?: string;
  comments?: string;
  // Campos específicos do Coffee Connection
  meetingDate?: string;
  meetingTime?: string;
  location?: string;
  topics?: string[];
  followUpActions?: string;
  confidential?: boolean;
}
