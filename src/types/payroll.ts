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
  payroll_id?: string;
  collaborator_id: string;
  // Dados pessoais vêm da tabela users via relacionamento
  collaborator_name: string; // users.full_name
  month: number;
  year: number;
  classification: string;
  role: string;
  base_salary: number;
  bonus: number;
  commission: number;
  reimbursement: number;
  transport: number; // passagem
  inss: number;
  store_discount: number; // lojinha
  bistro_discount: number; // bistro
  advance: number; // adiantamento
  other_discounts: number; // outros_descontos
  total_amount?: number;
  notes?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Dados pessoais que vêm da tabela users
  units: string[];
  department: string;
  bank: string;
  agency: string;
  account: string;
  cpf: string;
  pix: string;
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