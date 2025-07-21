
export interface Benefit {
  id: string;
  name: string;
  type: BenefitType;
  description: string;
  value: number;
  coverage: string[];
  eligibilityRules: EligibilityRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Fields that don't exist in DB but are needed for UI compatibility
  provider: string;
  startDate: string;
  endDate?: string;
  documents: string[];
  // Universal features - now available for all benefits
  performanceGoals?: PerformanceGoal[];
  renewalSettings?: RenewalSettings;
}

export interface BenefitType {
  id: string;
  name: string;
  category: 'health' | 'dental' | 'food' | 'transport' | 'education' | 'life' | 'performance' | 'other';
  icon: string;
  color: string;
}

export interface EligibilityRule {
  id: string;
  rule: string;
  value: string | number;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface EmployeeBenefit {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitId: string;
  benefitName: string;
  enrollmentDate: string;
  // Status is determined by dates: active if no end date or future end date
  dependents: Dependent[];
  documents: BenefitDocument[];
  lastUpdate: string;
  // Universal tracking - now available for all benefits
  performanceData?: PerformanceData;
  nextRenewalDate?: string;
  renewalStatus?: 'automatic' | 'requires_review' | 'expired';
}

export interface Dependent {
  id: string;
  name: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  birthDate: string;
  documentNumber: string;
  isActive: boolean;
}

export interface BenefitDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface BenefitStats {
  totalBenefits: number;
  activeBenefits: number;
  totalEnrollments: number;
  pendingApprovals: number;
  totalCost: number;
  mostPopularBenefit: string;
  utilizationRate: number;
  benefitsWithGoals: number;
  pendingRenewals: number;
}

export interface BenefitUsage {
  benefitId: string;
  benefitName: string;
  enrollments: number;
  utilizationRate: number;
  totalCost: number;
  avgCostPerEmployee: number;
}

// Universal performance and renewal interfaces
export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue?: number;
  unit: string;
  weight: number; // Percentage weight in overall performance
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
}

export interface RenewalSettings {
  id: string;
  renewalPeriod: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  requiresPerformanceReview: boolean;
  minimumPerformanceScore: number;
  autoRenewal: boolean;
  reminderDays: number;
  gracePeriodDays: number;
}

export interface PerformanceData {
  id: string;
  employeeId: string;
  benefitId: string;
  overallScore: number;
  goalProgress: GoalProgress[];
  lastEvaluationDate: string;
  nextEvaluationDate: string;
  evaluatorId: string;
  comments: string;
}

export interface GoalProgress {
  goalId: string;
  goalTitle: string;
  currentValue: number;
  targetValue: number;
  completionPercentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  lastUpdated: string;
}
