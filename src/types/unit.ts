
// Enum para unidades de usuários (sistema geral)
export enum Unit {
  CAMPO_GRANDE = 'campo-grande',
  BARRA = 'barra',
  RECREIO = 'recreio'
}

// Enum específico para unidades da folha de pagamento
export enum PayrollUnit {
  BARRA = 'barra',
  CG_EMLA = 'cg-emla',
  CG_LAMK = 'cg-lamk',
  PROFESSORES_MULTI_UNIDADE = 'professores-multi-unidade',
  RECREIO = 'recreio',
  STAFF_RATEADO = 'staff-rateado'
}

// Enum específico para unidades da agenda
export enum ScheduleUnit {
  CAMPO_GRANDE = 'campo-grande',
  BARRA = 'barra',
  RECREIO = 'recreio'
}

export interface UnitInfo {
  id: Unit;
  name: string;
  color: string;
  address?: string;
}

export interface PayrollUnitInfo {
  id: PayrollUnit;
  name: string;
  color: string;
  address?: string;
}

export interface ScheduleUnitInfo {
  id: ScheduleUnit;
  name: string;
  color: string;
  address?: string;
}

export const UNITS: UnitInfo[] = [
  {
    id: Unit.CAMPO_GRANDE,
    name: 'Campo Grande',
    color: 'bg-blue-500',
    address: 'Campo Grande, Rio de Janeiro'
  },
  {
    id: Unit.BARRA,
    name: 'Barra',
    color: 'bg-purple-500',
    address: 'Barra da Tijuca, Rio de Janeiro'
  },
  {
    id: Unit.RECREIO,
    name: 'Recreio',
    color: 'bg-green-500',
    address: 'Recreio dos Bandeirantes, Rio de Janeiro'
  }
];

export const PAYROLL_UNITS: PayrollUnitInfo[] = [
  {
    id: PayrollUnit.BARRA,
    name: 'Barra',
    color: 'bg-purple-500',
    address: 'Barra da Tijuca, Rio de Janeiro'
  },
  {
    id: PayrollUnit.CG_EMLA,
    name: 'CG EMLA',
    color: 'bg-blue-500',
    address: 'Campo Grande EMLA, Rio de Janeiro'
  },
  {
    id: PayrollUnit.CG_LAMK,
    name: 'CG LAMK',
    color: 'bg-cyan-500',
    address: 'Campo Grande LAMK, Rio de Janeiro'
  },
  {
    id: PayrollUnit.PROFESSORES_MULTI_UNIDADE,
    name: 'Professores Multi-Unidade',
    color: 'bg-orange-500',
    address: 'Múltiplas unidades'
  },
  {
    id: PayrollUnit.RECREIO,
    name: 'Recreio',
    color: 'bg-green-500',
    address: 'Recreio dos Bandeirantes, Rio de Janeiro'
  },
  {
    id: PayrollUnit.STAFF_RATEADO,
    name: 'Staff Rateado',
    color: 'bg-red-500',
    address: 'Múltiplas unidades'
  }
];

// Unidades específicas para agenda
export const SCHEDULE_UNITS: ScheduleUnitInfo[] = [
  {
    id: ScheduleUnit.CAMPO_GRANDE,
    name: 'Campo Grande',
    color: 'bg-blue-500',
    address: 'Campo Grande, Rio de Janeiro'
  },
  {
    id: ScheduleUnit.BARRA,
    name: 'Barra',
    color: 'bg-purple-500',
    address: 'Barra da Tijuca, Rio de Janeiro'
  },
  {
    id: ScheduleUnit.RECREIO,
    name: 'Recreio',
    color: 'bg-green-500',
    address: 'Recreio dos Bandeirantes, Rio de Janeiro'
  }
];

export const getUnitInfo = (unitId: Unit): UnitInfo => {
  return UNITS.find(unit => unit.id === unitId) || UNITS[0];
};

export const getPayrollUnitInfo = (unitId: PayrollUnit): PayrollUnitInfo => {
  return PAYROLL_UNITS.find(unit => unit.id === unitId) || PAYROLL_UNITS[0];
};

export const getScheduleUnitInfo = (unitId: ScheduleUnit): ScheduleUnitInfo => {
  return SCHEDULE_UNITS.find(unit => unit.id === unitId) || SCHEDULE_UNITS[0];
};

export const getUnitColor = (unitId: Unit): string => {
  return getUnitInfo(unitId).color;
};

export const getPayrollUnitColor = (unitId: PayrollUnit): string => {
  return getPayrollUnitInfo(unitId).color;
};

export const getScheduleUnitColor = (unitId: ScheduleUnit): string => {
  return getScheduleUnitInfo(unitId).color;
};
