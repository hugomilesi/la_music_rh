// Tipos e interfaces para o sistema de colaboradores
// Colaboradores são diferentes de usuários - não têm acesso ao sistema, apenas são registrados para controle administrativo

// ==================================================
// TIPOS ATUALIZADOS - Múltiplas Unidades
// ==================================================

// ===== NOVA INTERFACE: Unidade =====
export interface Unidade {
  id: string;
  nome: string;
  codigo: string;
  ativa: boolean;
  created_at: string;
}

// ===== NOVA INTERFACE: Vínculo Colaborador-Unidade =====
export interface ColaboradorUnidade {
  id: string;
  colaborador_id: string;
  unidade_id: string;
  created_at: string;
  unidade?: Unidade; // Join com dados da unidade
}

// ===== ENUM: UnidadeColaborador (mantido para compatibilidade) =====
export enum UnidadeColaborador {
  CAMPO_GRANDE = 'Campo Grande',
  BARRA = 'Barra',
  RECREIO = 'Recreio'
}

export enum TipoContratacao {
  CLT = 'CLT',
  PJ = 'PJ',
  ESTAGIARIO = 'Estágiário',
  FREELANCER = 'Freelancer',
  HORISTA = 'Horista'
}

export enum TipoConta {
  CORRENTE = 'corrente',
  POUPANCA = 'poupança'
}

export enum StatusColaborador {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

// ===== INTERFACE PRINCIPAL: Colaborador (ATUALIZADA) =====
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  cargo: string;
  departamento: string;
  data_admissao: string;

  // ❌ REMOVIDO: unidade: UnidadeColaborador;
  // ✅ ADICIONADO: Array de unidades vinculadas
  unidades?: ColaboradorUnidade[];

  tipo_contratacao: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status: StatusColaborador;
  created_at: string;
  updated_at: string;
}

// ===== INTERFACE: Criar Colaborador (ATUALIZADA) =====
export interface NovoColaborador {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;

  // ❌ REMOVIDO: unidade: UnidadeColaborador;
  // ✅ ADICIONADO: Array de IDs de unidades
  unidade_ids: string[];

  tipo_contratacao?: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status?: StatusColaborador;
}

// ===== INTERFACE: Atualizar Colaborador (ATUALIZADA) =====
export interface AtualizarColaborador {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cargo?: string;
  departamento?: string;

  // ❌ REMOVIDO: unidade?: UnidadeColaborador;
  // ✅ ADICIONADO: Array de IDs de unidades (opcional)
  unidade_ids?: string[];

  tipo_contratacao?: TipoContratacao;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: TipoConta;
  status?: StatusColaborador;
}

// ===== INTERFACE: Filtros (ATUALIZADA) =====
export interface FiltrosColaborador {
  searchTerm?: string;

  // ❌ REMOVIDO: unidade?: UnidadeColaborador | '';
  // ✅ ADICIONADO: Array de IDs de unidades (filtro múltiplo)
  unidade_ids?: string[];

  departamento?: string;
  tipo_contratacao?: TipoContratacao | '';
  status?: StatusColaborador | '';
}

// Utilitários para conversão e validação
export const UNIDADES_OPTIONS = [
  { value: UnidadeColaborador.CAMPO_GRANDE, label: 'Campo Grande' },
  { value: UnidadeColaborador.BARRA, label: 'Barra' },
  { value: UnidadeColaborador.RECREIO, label: 'Recreio' }
];

export const TIPOS_CONTRATACAO_OPTIONS = [
  { value: TipoContratacao.CLT, label: 'CLT' },
  { value: TipoContratacao.PJ, label: 'PJ' },
  { value: TipoContratacao.ESTAGIARIO, label: 'Estágiário' },
  { value: TipoContratacao.FREELANCER, label: 'Freelancer' },
  { value: TipoContratacao.HORISTA, label: 'Horista' }
];

export const TIPOS_CONTA_OPTIONS = [
  { value: TipoConta.CORRENTE, label: 'Corrente' },
  { value: TipoConta.POUPANCA, label: 'Poupança' }
];

export const STATUS_OPTIONS = [
  { value: StatusColaborador.ATIVO, label: 'Ativo' },
  { value: StatusColaborador.INATIVO, label: 'Inativo' }
];

// Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função para validar CPF
export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

// Função para validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};