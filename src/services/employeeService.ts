
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    try {
      console.log('EmployeeService: Buscando funcionários...');
      
      // Get all users from the unified users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .is('deleted_at', null)
        .order('username');
      
      if (error) {
        console.error('EmployeeService: Erro ao buscar funcionários:', error);
        throw error;
      }
      
      console.log('EmployeeService: Funcionários encontrados:', data?.length || 0);
      
      return data?.map(user => ({
        ...user,
        name: user.username,
        status: user.status === 'ativo' ? 'active' : 'inactive',
        units: Array.isArray(user.units) ? user.units.map((unit: string) => unit as Unit) : []
      })) || [];
    } catch (error) {
      console.error('EmployeeService: Erro em getEmployees:', error);
      throw error;
    }
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      console.log('EmployeeService: Buscando funcionário por ID:', id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();
      
      if (error) {
        console.error('EmployeeService: Erro ao buscar funcionário por ID:', error);
        throw error;
      }
      
      if (!data) {
        console.log('EmployeeService: Funcionário não encontrado');
        return null;
      }
      
      console.log('EmployeeService: Funcionário encontrado:', data.username);
      
      return {
        ...data,
        name: data.username,
        status: data.status === 'ativo' ? 'active' : 'inactive',
        units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
      };
    } catch (error) {
      console.error('EmployeeService: Erro em getEmployeeById:', error);
      throw error;
    }
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    try {
      console.log('EmployeeService: Criando funcionário:', employeeData.name);
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          position: employeeData.position,
          department: employeeData.department,
          status: employeeData.status === 'active' ? 'ativo' : 'inativo',
          units: employeeData.units || []
        })
        .select()
        .single();
      
      if (error) {
        console.error('EmployeeService: Erro ao criar funcionário:', error);
        throw error;
      }
      
      console.log('EmployeeService: Funcionário criado com sucesso:', data.username);
      
      return {
        ...data,
        name: data.username,
        status: data.status === 'ativo' ? 'active' : 'inactive',
        units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
      };
    } catch (error) {
      console.error('EmployeeService: Erro em createEmployee:', error);
      throw error;
    }
  },

  async updateEmployee(id: string, employeeData: Partial<NewEmployeeData>): Promise<Employee> {
    try {
      console.log('EmployeeService: Atualizando funcionário:', id);
      
      const updateData: any = {};
      
      if (employeeData.name) updateData.username = employeeData.name;
      if (employeeData.email) updateData.email = employeeData.email;
      if (employeeData.phone) updateData.phone = employeeData.phone;
      if (employeeData.position) updateData.position = employeeData.position;
      if (employeeData.department) updateData.department = employeeData.department;
      if (employeeData.status) updateData.status = employeeData.status === 'active' ? 'ativo' : 'inativo';
      if (employeeData.units) updateData.units = employeeData.units;
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('EmployeeService: Erro ao atualizar funcionário:', error);
        throw error;
      }
      
      console.log('EmployeeService: Funcionário atualizado com sucesso:', data.username);
      
      return {
        ...data,
        name: data.username,
        status: data.status === 'ativo' ? 'active' : 'inactive',
        units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
      };
    } catch (error) {
      console.error('EmployeeService: Erro em updateEmployee:', error);
      throw error;
    }
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      console.log('EmployeeService: Deletando funcionário:', id);
      
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        console.error('EmployeeService: Erro ao deletar funcionário:', error);
        throw error;
      }
      
      console.log('EmployeeService: Funcionário deletado com sucesso');
    } catch (error) {
      console.error('EmployeeService: Erro em deleteEmployee:', error);
      throw error;
    }
  }
};
