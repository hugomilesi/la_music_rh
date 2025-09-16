export interface Payroll {
  id: string;
  month: number;
  year: number;
  status: 'draft' | 'approved' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  unit: string;
  units: number;
  position: string;
  classification: string;
  salario_base: number;
  bonus: number;
  comissao: number;
  passagem: number;
  reembolso: number;
  inss: number;
  lojinha: number;
  bistro: number;
  adiantamento: number;
  outros_descontos: number;
  observacoes?: string;
  status: string;
  aprovado_por?: string;
  aprovado_em?: string;
  created_at: string;
  updated_at: string;
  payroll_id?: string;
  mes: number;
  ano: number;
  colaborador_id?: string;
  nome_colaborador?: string;
  cpf_colaborador?: string;
  unidade?: string;
}

export interface PayrollEntry {
  id: string;
  colaborador_id?: string;
  mes: number;
  ano: number;
  classificacao: string;
  funcao: string;
  salario_base: number;
  bonus: number;
  comissao: number;
  passagem: number;
  reembolso: number;
  inss: number;
  lojinha: number;
  bistro: number;
  adiantamento: number;
  outros_descontos: number;
  observacoes?: string;
  status: string;
  aprovado_por?: string;
  aprovado_em?: string;
  created_at: string;
  updated_at: string;
  payroll_id?: string;
  transport_voucher?: number;
  salary_advance?: number;
  nome_colaborador?: string;
  cpf_colaborador?: string;
  unidade?: string;
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