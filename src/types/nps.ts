
export interface NPSResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  score: number;
  comment: string;
  date: string;
  surveyId: string;
  category: 'promotor' | 'neutro' | 'detrator';
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
}

export interface NPSQuestion {
  id: string;
  type: 'nps' | 'text' | 'multiple_choice';
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
}

export interface NPSEvolution {
  date: string;
  score: number;
  responses: number;
}
