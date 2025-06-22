
export interface RecognitionCriterion {
  id: string;
  title: string;
  description: string;
  type: 'checkbox' | 'observation' | 'stars';
  weight: number; // Weight in stars for this criterion
  maxStars?: number; // Maximum stars for this criterion
  isRequired?: boolean;
}

export interface RecognitionProgram {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  criteria: RecognitionCriterion[];
  totalPossibleStars: number;
}

export interface CriterionEvaluation {
  criterionId: string;
  isCompleted: boolean;
  observation?: string;
  starsAwarded: number;
}

export interface EmployeeEvaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  programId: string;
  evaluations: CriterionEvaluation[];
  totalStars: number;
  evaluatedBy: string;
  evaluationDate: string;
  comments?: string;
}

// New enhanced types for detailed ranking
export interface ProgramStars {
  fideliza: number;
  matriculador: number;
  professor: number;
}

export interface EmployeeAchievement {
  id: string;
  employeeId: string;
  programId: string;
  title: string;
  description: string;
  starsAwarded: number;
  date: string;
  type: 'milestone' | 'bonus' | 'special';
}

export interface MonthlyProgress {
  month: string;
  fideliza: number;
  matriculador: number;
  professor: number;
  total: number;
}

export interface DetailedRankingEmployee {
  id: string;
  name: string;
  unit: string;
  role: string;
  avatar?: string;
  stars: ProgramStars;
  total: number;
  position: number;
  achievements: EmployeeAchievement[];
  monthlyProgress: MonthlyProgress[];
  metCriteria: {
    [programId: string]: string[];
  };
  joinDate: string;
  evaluationPeriod: string;
}
