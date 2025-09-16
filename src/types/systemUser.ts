
export interface SystemUser {
  id: number;
  auth_user_id?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'gestor_rh' | 'gerente';
  position?: string;
  department?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  createdAt: string;
  permissions: string[];
  hasProfile?: boolean;
}

export interface CreateSystemUserData {
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'gestor_rh' | 'gerente';
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
  role: 'super_admin' | 'admin' | 'gestor_rh' | 'gerente';
  position?: string;
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
