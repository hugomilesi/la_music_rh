
export interface Benefit {
  id: string;
  name: string;
  type: BenefitType;
  description: string;
  value: number;
  coverage: string[];
  eligibilityRules: EligibilityRule[];
  provider: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  documents: string[];
  maxBeneficiaries: number;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitType {
  id: string;
  name: string;
  category: 'health' | 'dental' | 'food' | 'transport' | 'education' | 'life' | 'other';
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
  status: 'active' | 'pending' | 'cancelled' | 'suspended';
  dependents: Dependent[];
  documents: BenefitDocument[];
  lastUpdate: string;
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
}

export interface BenefitUsage {
  benefitId: string;
  benefitName: string;
  enrollments: number;
  utilizationRate: number;
  totalCost: number;
  avgCostPerEmployee: number;
}
