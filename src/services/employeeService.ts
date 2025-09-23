
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      console.log('🔍 Buscando colaboradores...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('username', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar colaboradores:', error);
        throw error;
      }
      
      console.log('✅ Colaboradores encontrados:', data?.length || 0);
      
      const mappedData = data?.map(user => ({
        id: user.id,
        name: user.username || 'Nome não informado',
        email: user.email || 'Email não informado',
        phone: user.phone || '',
        position: user.position_id || 'Não informado',
        department: user.department || 'Não informado',
        units: [], // TODO: Implementar mapeamento de unidades
        start_date: user.created_at,
        status: user.status === 'ativo' ? 'ativo' : 'inativo',
        avatar: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: user.last_login,
        role: user.role,
        auth_user_id: user.auth_user_id
      })) || [];
      
      console.log('📊 Dados mapeados:', mappedData);
      return mappedData;
      
    } catch (error) {
      console.error('💥 Erro crítico no employeeService.getEmployees:', error);
      throw error;
    }
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      name: data.username,
      email: data.email,
      phone: data.phone || '',
      position: data.position_id || 'Não informado',
      department: data.department || 'Não informado',
      units: [], // TODO: Implementar mapeamento de unidades
      start_date: data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: data.last_login,
      role: data.role,
      auth_user_id: data.auth_user_id
    };
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    const insertData = {
      username: employeeData.name,
      email: employeeData.email,
      role: employeeData.role,
      department: employeeData.department,
      position_id: employeeData.position,
      phone: employeeData.phone,
      status: employeeData.status || 'ativo',
      is_active: true
    };

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.username,
      email: data.email,
      phone: data.phone || '',
      position: data.position_id || 'Não informado',
      department: data.department || 'Não informado',
      units: [], // TODO: Implementar mapeamento de unidades
      start_date: data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: data.last_login,
      role: data.role,
      auth_user_id: data.auth_user_id
    };
  },

  async updateEmployee(id: string, employeeData: Partial<NewEmployeeData>): Promise<Employee> {
    const updateData: any = {};
    
    if (employeeData.name) updateData.username = employeeData.name;
    if (employeeData.email) updateData.email = employeeData.email;
    if (employeeData.role) updateData.role = employeeData.role;
    if (employeeData.department) updateData.department = employeeData.department;
    if (employeeData.position) updateData.position_id = employeeData.position;
    if (employeeData.phone) updateData.phone = employeeData.phone;
    if (employeeData.status) updateData.status = employeeData.status;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.username,
      email: data.email,
      phone: data.phone || '',
      position: data.position_id || 'Não informado',
      department: data.department || 'Não informado',
      units: [], // TODO: Implementar mapeamento de unidades
      start_date: data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: data.avatar_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: data.last_login,
      role: data.role,
      auth_user_id: data.auth_user_id
    };
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
};
