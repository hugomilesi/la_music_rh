import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  department_id: string;
  description?: string;
  permissions?: any;
  is_active?: boolean;
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
    throw error;
  }

  return data || [];
};

export const createDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>): Promise<Department> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

// Role CRUD operations
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        department:departments(id, name)
      `)
      .order('name');

    if (error) {
      throw error;
    }

    // Transform the data to match our Role interface
    const transformedData = data?.map(role => ({
      ...role,
      department_name: role.department?.name || 'Sem departamento'
    })) || [];

    return transformedData;
  } catch (error) {
    throw error;
  }
};

// Get roles by department
export const fetchRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        department:departments(id, name)
      `)
      .eq('department_id', departmentId)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};

// Create a new role
export const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([role])
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Update a role
export const updateRole = async (id: string, updates: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>): Promise<Role> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        department:departments(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Delete a role
export const deleteRole = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

// Count employees by role
export const countEmployeesByRole = async (roleId: string): Promise<number> => {
  try {
    // First, get the role to ensure it exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return 0;
    }

    // Count users with this role using the role name (not role_id)
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', role.name);

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    throw error;
  }
};