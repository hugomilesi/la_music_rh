
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
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
  startDate: string;
}
