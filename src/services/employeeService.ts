
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    // Get all users from the unified users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('full_name');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
    
    return data?.map(user => ({
      ...user,
      name: user.full_name,
      status: user.status === 'ativo' ? 'active' : 'inactive',
      units: Array.isArray(user.units) ? user.units.map((unit: string) => unit as Unit) : []
    })) || [];
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('users') 
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data ? {
      ...data,
      name: data.full_name,
      status: data.status === 'ativo' ? 'active' : 'inactive',
      units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
    } : null;
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    const userData = {
      full_name: employeeData.full_name || employeeData.name,
      email: employeeData.email,
      phone: employeeData.phone,
      position: employeeData.position,
      department: employeeData.department,
      units: employeeData.units,
      start_date: employeeData.start_date,
      birth_date: employeeData.birth_date,
      address: employeeData.address,
      emergency_contact: employeeData.emergency_contact,
      emergency_phone: employeeData.emergency_phone,
      bio: employeeData.bio,
      avatar_url: employeeData.avatar_url,
      role: employeeData.role || 'usuario',
      nivel: employeeData.nivel,
      status: 'ativo',
      preferences: employeeData.preferences || {}
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return {
      ...data,
      name: data.full_name,
      status: data.status === 'ativo' ? 'active' : 'inactive',
      units: employeeData.units
    };
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    // Map frontend field names to database field names
    const { name, ...otherUpdates } = updates;
    const updatesWithMappedFields = {
      ...otherUpdates,
      ...(name && { full_name: name }),
      ...(updates.status && { status: updates.status === 'active' ? 'ativo' : 'inativo' })
    };

    const { data, error } = await supabase
      .from('users')
      .update(updatesWithMappedFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    return {
      ...data,
      name: data.full_name,
      status: data.status === 'ativo' ? 'active' : 'inactive',
      units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
    };
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      // Soft delete the user by setting deleted_at timestamp
      const { error } = await supabase
        .from('users')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'inativo'
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete user:', error);
      throw error;
    }
  }
};
