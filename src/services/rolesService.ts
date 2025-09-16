import { supabase } from '@/integrations/supabase/client';

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
  employees: number;
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

  // Transform the data to match the expected interface
  const transformedData = data?.map(role => ({
    ...role,
    department: role.department || null,
    employees: 0 // Default value, will be updated by countEmployeesByRole if needed
  })) || [];

  return transformedData;
};







// Get roles by department
export const fetchRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      *,
      department:departments(*)
    `)
    .eq('department_id', departmentId)
    .order('name');

  if (error) {
    throw new Error(`Erro ao buscar cargos do departamento: ${error.message}`);
  }

  return data || [];
};

// Count employees by role
export const countEmployeesByRole = async (roleId: string): Promise<number> => {
  try {
    // First get the role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (roleError || !roleData) {
      // Could not find role warning disabled
      return 0;
    }

    // Count users with this role
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', roleData.name)
      .neq('status', 'inactive');

    if (error) {
      // Could not count users for role warning disabled
      return 0;
    }

    return count || 0;
  } catch (error) {
    // Error counting employees for role warning disabled
    return 0;
  }
};