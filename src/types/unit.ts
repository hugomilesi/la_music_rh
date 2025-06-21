
export enum Unit {
  CAMPO_GRANDE = 'campo-grande',
  RECREIO = 'recreio',
  BARRA = 'barra'
}

export interface UnitInfo {
  id: Unit;
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
    id: Unit.RECREIO,
    name: 'Recreio',
    color: 'bg-green-500',
    address: 'Recreio dos Bandeirantes, Rio de Janeiro'
  },
  {
    id: Unit.BARRA,
    name: 'Barra',
    color: 'bg-purple-500',
    address: 'Barra da Tijuca, Rio de Janeiro'
  }
];

export const getUnitInfo = (unitId: Unit): UnitInfo => {
  return UNITS.find(unit => unit.id === unitId) || UNITS[0];
};

export const getUnitColor = (unitId: Unit): string => {
  return getUnitInfo(unitId).color;
};
