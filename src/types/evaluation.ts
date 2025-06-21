
export interface Evaluation {
  id: string;
  employeeId: string;
  employee: string;
  role: string;
  unit: string;
  type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor';
  period: string;
  score: number;
  status: 'Concluída' | 'Pendente' | 'Em Andamento';
  date: string;
  evaluatorId?: string;
  evaluator?: string;
  comments?: string;
}

export interface NewEvaluationData {
  employeeId: string;
  type: 'Avaliação 360°' | 'Auto Avaliação' | 'Avaliação do Gestor';
  period: string;
  evaluatorId?: string;
  comments?: string;
}
