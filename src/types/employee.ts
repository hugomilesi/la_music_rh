
import { Unit } from './unit';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[]; // Changed from single unit to array of units
  startDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface NewEmployeeData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  units: Unit[]; // Changed from single unit to array of units
  startDate: string;
}
