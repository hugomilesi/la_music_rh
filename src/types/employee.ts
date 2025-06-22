
import { Unit } from './unit';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[];
  start_date: string; // Changed from startDate to match database column
  status: 'active' | 'inactive';
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewEmployeeData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[];
  start_date: string; // Changed from startDate to match database column
}
