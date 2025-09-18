
export enum Unit {
  RECREIO = 'recreio',
  CG_EMLA = 'cg-emla',
  CG_LAMK = 'cg-lamk',
  BARRA = 'barra',
  STAFF_RATEADO = 'staff-rateado',
  PROFESSORES_MULTI_UNIDADE = 'professores-multi-unidade'
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

export interface ScheduleUnitInfo {
  id: ScheduleUnit;
  name: string;
  color: string;
  address?: string;
}

export const UNITS: UnitInfo[] = [
  {
    id: Unit.RECREIO,
    name: 'Recreio',
    color: 'bg-green-500',
    address: 'Recreio dos Bandeirantes, Rio de Janeiro'
  },
  {
    id: Unit.CG_EMLA,
    name: 'CG EMLA',
    color: 'bg-blue-500',
    address: 'Campo Grande EMLA, Rio de Janeiro'
  },
  {
    id: Unit.CG_LAMK,
    name: 'CG LAMK',
    color: 'bg-cyan-500',
    address: 'Campo Grande LAMK, Rio de Janeiro'
  },
  {
    id: Unit.BARRA,
    name: 'Barra',
    color: 'bg-purple-500',
    address: 'Barra da Tijuca, Rio de Janeiro'
  },
  {
    id: Unit.STAFF_RATEADO,
    name: 'Staff Rateado',
    color: 'bg-orange-500',
    address: 'Staff Rateado'
  },
  {
    id: Unit.PROFESSORES_MULTI_UNIDADE,
    name: 'Professores Multi-Unidade',
    color: 'bg-pink-500',
    address: 'Professores Multi-Unidade'
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

export const getScheduleUnitInfo = (unitId: ScheduleUnit): ScheduleUnitInfo => {
  return SCHEDULE_UNITS.find(unit => unit.id === unitId) || SCHEDULE_UNITS[0];
};

export const getUnitColor = (unitId: Unit): string => {
  return getUnitInfo(unitId).color;
};

export const getScheduleUnitColor = (unitId: ScheduleUnit): string => {
  return getScheduleUnitInfo(unitId).color;
};
