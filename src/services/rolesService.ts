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
  console.log('RolesService: Iniciando busca de departamentos');
  
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('RolesService: Erro ao buscar departamentos:', error);
      throw new Error(`Erro ao buscar departamentos: ${error.message}`);
    }

    console.log('RolesService: Departamentos encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('RolesService: Erro na busca de departamentos:', error);
    throw error;
  }
};

export const createDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> => {
  try {
    console.log('🔄 RolesService: Criando departamento:', department);
    
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) {
      console.error('❌ RolesService: Erro ao criar departamento:', error);
      throw new Error(`Erro ao criar departamento: ${error.message}`);
    }

    console.log('✅ RolesService: Departamento criado com sucesso:', data.id);
    return data;
  } catch (error) {
    console.error('❌ RolesService: Erro na criação de departamento:', error);
    throw error;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Omit<Department, 'id' | 'created_at' | 'updated_at'>>): Promise<Department> => {
  try {
    console.log('🔄 RolesService: Atualizando departamento:', id);
    
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ RolesService: Erro ao atualizar departamento:', error);
      throw new Error(`Erro ao atualizar departamento: ${error.message}`);
    }

    console.log('✅ RolesService: Departamento atualizado com sucesso');
    return data;
  } catch (error) {
    console.error('❌ RolesService: Erro na atualização de departamento:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    console.log('🔄 RolesService: Deletando departamento:', id);
    
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ RolesService: Erro ao deletar departamento:', error);
      throw new Error(`Erro ao deletar departamento: ${error.message}`);
    }

    console.log('✅ RolesService: Departamento deletado com sucesso');
  } catch (error) {
    console.error('❌ RolesService: Erro na deleção de departamento:', error);
    throw error;
  }
};

// Role CRUD operations
export const fetchRoles = async (): Promise<RoleWithDepartment[]> => {
  try {
    console.log('🔄 RolesService: Iniciando busca de cargos');
    
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        department:departments(*)
      `)
      .order('name');

    if (error) {
      console.error('❌ RolesService: Erro ao buscar cargos:', error);
      throw new Error(`Erro ao buscar cargos: ${error.message}`);
    }

    // Transform the data to match the expected interface
    const transformedData = data?.map(role => ({
      ...role,
      department: role.department || null,
      employees: 0 // Default value, will be updated by countEmployeesByRole if needed
    })) || [];

    console.log('✅ RolesService: Cargos encontrados:', transformedData.length);
    return transformedData;
  } catch (error) {
    console.error('❌ RolesService: Erro na busca de cargos:', error);
    throw error;
  }
};

// Get roles by department
export const fetchRolesByDepartment = async (departmentId: string): Promise<Role[]> => {
  try {
    console.log('🔄 RolesService: Buscando cargos do departamento:', departmentId);
    
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('department_id', departmentId)
      .order('name');

    if (error) {
      console.error('❌ RolesService: Erro ao buscar cargos do departamento:', error);
      throw new Error(`Erro ao buscar cargos do departamento: ${error.message}`);
    }

    console.log('✅ RolesService: Cargos do departamento encontrados:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ RolesService: Erro na busca de cargos do departamento:', error);
    throw error;
  }
};

// Count employees by role
export const countEmployeesByRole = async (roleId: string): Promise<number> => {
  try {
    console.log('🔄 RolesService: Contando funcionários por cargo:', roleId);
    
    // First get the role name
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (roleError || !roleData) {
      console.log('⚠️ RolesService: Cargo não encontrado para contagem');
      return 0;
    }

    // Count users with this role
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', roleData.name)
      .neq('status', 'inactive');

    if (error) {
      console.error('❌ RolesService: Erro ao contar usuários do cargo:', error);
      return 0;
    }

    console.log('✅ RolesService: Funcionários contados:', count || 0);
    return count || 0;
  } catch (error) {
    console.error('❌ RolesService: Erro na contagem de funcionários por cargo:', error);
    return 0;
  }
};