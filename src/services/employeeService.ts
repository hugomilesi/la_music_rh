
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar colaboradores:', error);
        throw error;
      }
      
      const mappedData = data?.map(colaborador => ({
        id: colaborador.id,
        name: colaborador.nome || 'Nome não informado',
        email: colaborador.email || 'Email não informado',
        phone: colaborador.telefone || '',
        position: colaborador.cargo || 'Não informado',
        department: colaborador.departamento || 'Não informado',
        units: colaborador.unidade ? [colaborador.unidade] : [],
        start_date: colaborador.data_admissao || colaborador.created_at,
        status: colaborador.status === 'ativo' ? 'ativo' : 'inativo',
        avatar: null, // colaboradores não tem avatar_url
        created_at: colaborador.created_at,
        updated_at: colaborador.updated_at,
        last_login: null, // colaboradores não tem last_login
        role: null, // colaboradores não tem role
        auth_user_id: null // colaboradores não tem auth_user_id
      })) || [];
      
      return mappedData;
      
    } catch (error) {
      console.error('💥 Erro crítico no employeeService.getEmployees:', error);
      throw error;
    }
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('colaboradores')
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
      name: data.nome,
      email: data.email,
      phone: data.telefone || '',
      position: data.cargo || 'Não informado',
      department: data.departamento || 'Não informado',
      units: data.unidade ? [data.unidade] : [],
      start_date: data.data_admissao || data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: null, // colaboradores não tem avatar_url
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: null, // colaboradores não tem last_login
      role: null, // colaboradores não tem role
      auth_user_id: null // colaboradores não tem auth_user_id
    };
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    const insertData = {
      nome: employeeData.name,
      email: employeeData.email,
      departamento: employeeData.department,
      cargo: employeeData.position,
      telefone: employeeData.phone,
      status: employeeData.status || 'ativo',
      data_admissao: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('colaboradores')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.nome,
      email: data.email,
      phone: data.telefone || '',
      position: data.cargo || 'Não informado',
      department: data.departamento || 'Não informado',
      units: data.unidade ? [data.unidade] : [],
      start_date: data.data_admissao || data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: null, // colaboradores não tem avatar_url
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: null, // colaboradores não tem last_login
      role: null, // colaboradores não tem role
      auth_user_id: null // colaboradores não tem auth_user_id
    };
  },

  async updateEmployee(id: string, employeeData: Partial<NewEmployeeData>): Promise<Employee> {
    const updateData: any = {};
    
    if (employeeData.name) updateData.nome = employeeData.name;
    if (employeeData.email) updateData.email = employeeData.email;
    if (employeeData.department) updateData.departamento = employeeData.department;
    if (employeeData.position) updateData.cargo = employeeData.position;
    if (employeeData.phone) updateData.telefone = employeeData.phone;
    if (employeeData.status) updateData.status = employeeData.status;
    
    const { data, error } = await supabase
      .from('colaboradores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      id: data.id,
      name: data.nome,
      email: data.email,
      phone: data.telefone || '',
      position: data.cargo || 'Não informado',
      department: data.departamento || 'Não informado',
      units: data.unidade ? [data.unidade] : [],
      start_date: data.data_admissao || data.created_at,
      status: data.status === 'ativo' ? 'ativo' : 'inativo',
      avatar: null, // colaboradores não tem avatar_url
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_login: null, // colaboradores não tem last_login
      role: null, // colaboradores não tem role
      auth_user_id: null // colaboradores não tem auth_user_id
    };
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
  }
};
