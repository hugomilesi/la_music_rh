
export enum Unit {
  CAMPO_GRANDE = 'campo-grande',
  BARRA = 'barra',
  RECREIO = 'recreio'
}

export interface Employee {
  id: string;
  name: string; // mapped from username
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[];
  start_date: string;
  status: 'ativo' | 'inativo'; // aligned with database values
  avatar?: string; // mapped from avatar_url if available
  created_at: string;
  updated_at: string;
  last_login?: string;
  role: string;
  auth_user_id?: string;
}

export interface NewEmployeeData {
  name: string; // will be mapped to username
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[];
  start_date: string;
  role?: string;
  status?: 'ativo' | 'inativo';
}
