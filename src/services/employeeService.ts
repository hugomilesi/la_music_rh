
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    return data || [];
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
    
    return data;
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
    
    return data;
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
    
    return data;
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }
};
