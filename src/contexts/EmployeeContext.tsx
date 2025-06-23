
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, NewEmployeeData } from '@/types/employee';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';

interface EmployeeContextType {
  employees: Employee[];
  filteredEmployees: Employee[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (department: string) => void;
  setStatusFilter: (status: string) => void;
  addEmployee: (employee: NewEmployeeData) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeesByUnit: (unit: string) => Employee[];
  refreshEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading employees...');
      const data = await employeeService.getEmployees();
      console.log('Employees loaded:', data.length);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar funcionários: " + errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    try {
      const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
      const matchesStatus = statusFilter === '' || employee.status === statusFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    } catch (error) {
      console.error('Error filtering employee:', employee, error);
      return false;
    }
  });

  const addEmployee = async (employeeData: NewEmployeeData) => {
    try {
      console.log('Adding employee:', employeeData);
      const newEmployee = await employeeService.createEmployee(employeeData);
      console.log('Employee added:', newEmployee);
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      console.log('Updating employee:', id, updates);
      const updatedEmployee = await employeeService.updateEmployee(id, updates);
      console.log('Employee updated:', updatedEmployee);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao atualizar funcionário: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      console.log('Deleting employee:', id);
      await employeeService.deleteEmployee(id);
      console.log('Employee deleted:', id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso",
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário: " + errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const getEmployeesByUnit = (unit: string) => {
    try {
      return employees.filter(employee => employee.units.includes(unit as any));
    } catch (error) {
      console.error('Error filtering employees by unit:', error);
      return [];
    }
  };

  const refreshEmployees = async () => {
    await loadEmployees();
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      filteredEmployees,
      isLoading,
      error,
      searchTerm,
      departmentFilter,
      statusFilter,
      setSearchTerm,
      setDepartmentFilter,
      setStatusFilter,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      getEmployeesByUnit,
      refreshEmployees
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
