
export enum Unit {
  CAMPO_GRANDE = 'campo_grande',
  BARRA = 'barra',
  RECREIO = 'recreio'
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[];
  start_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
