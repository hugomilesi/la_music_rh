
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmployeeContextType {
  employees: Employee[];
  filteredEmployees: Employee[];
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
  isLoading: boolean;
  addEmployee: (data: NewEmployeeData) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (department: string) => void;
  setStatusFilter: (status: string) => void;
  getEmployeesForUnits: (units: Unit[]) => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch employees from Supabase
  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar colaboradores.',
          variant: 'destructive',
        });
        return;
      }

      // Transform database data to match our interface
      const transformedEmployees: Employee[] = data.map(emp => ({
        ...emp,
        status: emp.status as 'active' | 'inactive', // Ensure proper type casting
        units: emp.units as Unit[]
      }));

      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar colaboradores.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Setup real-time subscription
  useEffect(() => {
    fetchEmployees();

    const channel = supabase
      .channel('employees-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employees' },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchEmployees(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === '' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const addEmployee = useCallback(async (data: NewEmployeeData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('employees')
        .insert([{
          name: data.name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          department: data.department,
          units: data.units,
          start_date: data.start_date,
          status: 'active'
        }]);

      if (error) {
        console.error('Error adding employee:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao adicionar colaborador.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Colaborador adicionado com sucesso.',
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar colaborador.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    try {
      // Transform data to match database schema
      const updateData: any = { ...data };
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const { error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating employee:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar colaborador.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Colaborador atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar colaborador.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao remover colaborador.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Colaborador removido com sucesso.',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover colaborador.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getEmployeesForUnits = useCallback((units: Unit[]) => {
    if (units.length === 0) return [];
    return employees.filter(employee => 
      employee.units.some(unit => units.includes(unit))
    );
  }, [employees]);

  return (
    <EmployeeContext.Provider value={{
      employees,
      filteredEmployees,
      searchTerm,
      departmentFilter,
      statusFilter,
      isLoading,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      setSearchTerm,
      setDepartmentFilter,
      setStatusFilter,
      getEmployeesForUnits
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
