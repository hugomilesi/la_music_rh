
export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
}

export interface CriterionFormData {
  name: string;
  description: string;
  weight: number;
  isActive: boolean;
}
