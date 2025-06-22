
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
