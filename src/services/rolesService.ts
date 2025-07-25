import { supabase } from '../lib/supabase';

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  department_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface RoleWithDepartment extends Role {
  department: Department;
}

// Department CRUD operations
export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Erro ao buscar departamentos: ${error.message}`);
  }

  return data || [];
};

export const createDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert([department])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar departamento: ${error.message}`);
  }

  return data;
};

export const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar departamento: ${error.message}`);
  }

  return data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar departamento: ${error.message}`);
  }
};

// Role CRUD operations
export const fetchRoles = async (): Promise<RoleWithDepartment[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      *,
      department:departments(*)
    `)
    .order('name');

  if (error) {
    throw new Error(`Erro ao buscar cargos: ${error.message}`);
  }

  return data || [];
};

export const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .insert([role])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar cargo: ${error.message}`);
  }

  return data;
};

export const updateRole = async (id: string, updates: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar cargo: ${error.message}`);
  }

  return data;
};

export const deleteRole = async (id: string): Promise<void> => {
  // First get the role name to check if it's being used by employees
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('name')
    .eq('id', id)
    .single();

  if (roleError) {
    throw new Error(`Erro ao buscar cargo: ${roleError.message}`);
  }

  // Check if role name is being used by employees
  const { data: employees, error: checkError } = await supabase
    .from('employees')
    .select('id')
    .eq('position', role.name)
    .limit(1);

  if (checkError) {
    throw new Error(`Erro ao verificar uso do cargo: ${checkError.message}`);
  }

  if (employees && employees.length > 0) {
    throw new Error('Não é possível excluir um cargo que está sendo usado por funcionários.');
  }

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar cargo: ${error.message}`);
  }
};

// Get roles by department
export const fetchRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('department_id', departmentId)
    .order('name');

  if (error) {
    throw new Error(`Erro ao buscar cargos do departamento: ${error.message}`);
  }

  return data || [];
};

// Count employees by role
export const countEmployeesByRole = async (roleName: string): Promise<number> => {
  const { count, error } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('position', roleName);

  if (error) {
    throw new Error(`Erro ao contar funcionários: ${error.message}`);
  }

  return count || 0;
};