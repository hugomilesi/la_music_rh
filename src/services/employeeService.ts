
import { supabase } from '@/integrations/supabase/client';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

export const employeeService = {
  async getEmployees(): Promise<Employee[]> {
    // Get all employees - we'll handle auth checking in the frontend if needed
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    return data?.map(employee => ({
      ...employee,
      status: employee.status as 'active' | 'inactive',
      units: Array.isArray(employee.units) ? employee.units.map((unit: string) => unit as Unit) : []
    })) || [];
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
    
    return data ? {
      ...data,
      status: data.status as 'active' | 'inactive',
      units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
    } : null;
  },

  async createEmployee(employeeData: NewEmployeeData): Promise<Employee> {
    // Copiar o valor de start_date para data_admissao e position para cargo para evitar erros de NOT NULL constraint
    const employeeDataWithRequiredFields = {
      ...employeeData,
      data_admissao: employeeData.start_date,
      cargo: employeeData.position,
      departamento: employeeData.department
    };

    const { data, error } = await supabase
      .from('employees')
      .insert([employeeDataWithRequiredFields])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'active' | 'inactive',
      units: employeeData.units
    };
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    // Map frontend field names to database field names and remove original fields
    // Only use Portuguese column names since they are the NOT NULL ones
    const { start_date, position, department, units, ...otherUpdates } = updates;
    const updatesWithMappedFields = {
      ...otherUpdates,
      ...(start_date && { data_admissao: start_date }),
      ...(position && { cargo: position }),
      ...(department && { departamento: department }),
      ...(units && { units: JSON.stringify(units) })
    };

    const { data, error } = await supabase
      .from('employees')
      .update(updatesWithMappedFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'active' | 'inactive',
      units: Array.isArray(data.units) ? data.units.map((unit: string) => unit as Unit) : []
    };
  },

  async deleteEmployee(id: string): Promise<void> {
    try {
      // Delete related records in cascade to avoid foreign key constraint violations
      
      // 1. Delete evaluations where employee is evaluator or being evaluated
      await supabase.from('evaluations').delete().eq('employee_id', id);
      await supabase.from('evaluations').delete().eq('evaluator_id', id);
      
      // 2. Delete employee evaluations where employee is evaluated or evaluator
      await supabase.from('employee_evaluations').delete().eq('employee_id', id);
      await supabase.from('employee_evaluations').delete().eq('evaluated_by', id);
      
      // 3. Delete employee benefits
      await supabase.from('employee_benefits').delete().eq('employee_id', id);
      await supabase.from('employee_benefits').delete().eq('approved_by', id);
      
      // 4. Delete vacation requests and balances
      await supabase.from('vacation_requests').delete().eq('employee_id', id);
      await supabase.from('vacation_requests').delete().eq('aprovador_id', id);
      await supabase.from('vacation_balances').delete().eq('employee_id', id);
      
      // 5. Delete employee achievements
      await supabase.from('employee_achievements').delete().eq('employee_id', id);
      await supabase.from('employee_achievements').delete().eq('created_by', id);
      
      // 6. Delete documents
      await supabase.from('documents').delete().eq('employee_id', id);
      
      // 7. Delete monthly progress
      await supabase.from('monthly_progress').delete().eq('employee_id', id);
      
      // 8. Delete recognition bonuses
      await supabase.from('recognition_bonuses').delete().eq('employee_id', id);
      await supabase.from('recognition_bonuses').delete().eq('created_by', id);
      
      // 9. Delete delivered prizes
      await supabase.from('delivered_prizes').delete().eq('employee_id', id);
      await supabase.from('delivered_prizes').delete().eq('delivered_by', id);
      
      // 10. Delete incidents
      await supabase.from('incidents').delete().eq('employee_id', id);
      await supabase.from('incidents').delete().eq('reporter_id', id);
      
      // 11. Delete schedules and schedule events
      await supabase.from('schedules').delete().eq('employee_id', id);
      await supabase.from('schedule_events').delete().eq('employee_id', id);
      
      // 12. Delete benefit performance data
      await supabase.from('benefit_performance_data').delete().eq('employee_id', id);
      
      // 13. Delete benefit renewals
      await supabase.from('benefit_renewals').delete().eq('requested_by', id);
      await supabase.from('benefit_renewals').delete().eq('reviewed_by', id);
      
      // 14. Update employees that have this employee as manager (set manager_id to null)
      await supabase.from('employees').update({ manager_id: null }).eq('manager_id', id);
      
      // 15. Finally, delete the employee
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting employee:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in cascade delete employee:', error);
      throw error;
    }
  }
};
