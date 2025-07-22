export interface Payroll {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface PayrollEntry {
  id: string;
  payroll_id: string;
  collaborator_id: string;
  collaborator_name: string;
  collaborator_email: string;
  collaborator_phone: string;
  classification: string;
  role: string;
  base_salary: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  transport_voucher: number;
  inss: number;
  store_expenses: number;
  bistro_expenses: number;
  salary_advance: number;
  other_discounts: number;
  notes?: string;
  status: string;
  month: number;
  year: number;
  payroll_status: string;
  total_earnings: number;
  total_deductions: number;
  net_total: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollAllocation {
  id: string;
  folha_pagamento_id: string;
  unidade_id: string;
  valor: number;
  percentual: number;
}

export interface Unit {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
}

export interface PayrollAllocationSummary {
  folha_pagamento_id: string;
  collaborator_id: string;
  collaborator_name: string;
  unit_allocation_summary: string;
}

export interface PayrollFilters {
  unit?: string;
  classification?: string;
  role?: string;
  name?: string;
}

export interface PayrollTotals {
  total_earnings: number;
  total_deductions: number;
  net_total: number;
  unit_totals: Record<string, number>;
}