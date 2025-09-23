
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
  targetRoles: string[]; // Cargos elegíveis para este programa
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
  eligiblePrograms: string[]; // Programas elegíveis baseados no cargo
}

// Mapeamento de cargos para programas
export const ROLE_PROGRAM_MAPPING: { [key: string]: string[] } = {
  // Administrativo/Recepção - Fideliza+
  'Coordenadora Pedagógica': ['fideliza'],
  'Recepcionista': ['fideliza'],
  'Coordenador Administrativo': ['fideliza'],
  
  // Vendas - Matriculador+ LA
  'Consultor de Vendas': ['matriculador'],
  'Consultora de Vendas': ['matriculador'],
  'Coordenadora de Vendas': ['matriculador'],
  'Coordenador de Vendas': ['matriculador'],
  
  // Professores - Professor+ LA
  'Professor': ['professor'],
  'Professor Senior': ['professor'],
  'Professora': ['professor'],
  'Coordenador Pedagógico': ['professor'],
  
  // Cargos híbridos (podem participar de múltiplos programas)
  'Gerente Geral': ['fideliza', 'matriculador', 'professor'],
  'Diretor': ['fideliza', 'matriculador', 'professor'],
};

export function getEligiblePrograms(role: string): string[] {
  return ROLE_PROGRAM_MAPPING[role] || [];
}

export function isEligibleForProgram(role: string, programId: string): boolean {
  const eligiblePrograms = getEligiblePrograms(role);
  return eligiblePrograms.includes(programId);
}
