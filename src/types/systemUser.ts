
export interface SystemUser {
  id: number;
  auth_user_id?: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'gestor_rh' | 'gerente';
  position?: string;
  phone?: string;
  unit?: string;
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
  phone?: string;
  unit?: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

export interface SystemUserFilters {
  searchQuery: string;
  role: string;
  status: string;
}
