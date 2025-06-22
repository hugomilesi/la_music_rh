
export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'coordenador' | 'professor' | 'usuario';
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  createdAt: string;
  permissions: string[];
}

export interface CreateSystemUserData {
  name: string;
  email: string;
  role: 'admin' | 'coordenador' | 'professor' | 'usuario';
  department?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface UpdateSystemUserData {
  name: string;
  email: string;
  role: 'admin' | 'coordenador' | 'professor' | 'usuario';
  department?: string;
  phone?: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface SystemUserFilters {
  searchQuery: string;
  role: string;
  department: string;
  status: string;
}
