
export interface NPSResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  comment: string;
  date: string;
  surveyId: string;
  category: 'promotor' | 'neutro' | 'detrator' | 'satisfeito' | 'neutro_satisfacao' | 'insatisfeito';
  department?: string;
}

export interface NPSSurvey {
  id: string;
  title: string;
  description: string;
  questions: NPSQuestion[];
  status: 'draft' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  responses: NPSResponse[];
  targetEmployees: string[];
  targetDepartments: string[];
  surveyType: 'nps' | 'satisfaction';
  isAnonymous?: boolean;
  autoSend?: boolean;
  frequencyDays?: number;
  lastSentAt?: string;
  nextSendDate?: string;
  surveyLink?: string; // Link completo da pesquisa para n8n
  createdAt?: string;
  updatedAt?: string;
}

export interface NPSQuestion {
  id: string;
  type: 'nps' | 'satisfaction' | 'text' | 'multiple_choice';
  question: string;
  required: boolean;
  options?: string[];
}

export interface NPSStats {
  currentScore: number;
  previousScore: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  totalResponses: number;
  responseRate: number;
  // Novas estatísticas para pesquisas de satisfação
  satisfied?: number;
  neutralSatisfaction?: number;
  dissatisfied?: number;
}

export interface NPSEvolution {
  date: string;
  score: number;
  responses: number;
}

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

export interface NPSAutomationConfig {
  id: string;
  survey_id: string;
  is_active: boolean;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  frequency_value: number;
  send_time: string; // HH:MM format
  target_day_of_week?: number; // 0-6 (Sunday-Saturday)
  target_day_of_month?: number; // 1-31
  last_execution_date?: string;
  next_execution_date: string;
  created_at: string;
  updated_at: string;
}
