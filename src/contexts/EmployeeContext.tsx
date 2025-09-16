
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
      // Log desabilitado: Loading employees
      const data = await employeeService.getEmployees();
      // Log desabilitado: Employees loaded
      setEmployees(data);
    } catch (error) {
      // Log desabilitado: Error loading employees
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
      // Log desabilitado: Error filtering employee
      return false;
    }
  });

  const addEmployee = async (employeeData: NewEmployeeData) => {
    try {
      // Log desabilitado: Adding employee
      const newEmployee = await employeeService.createEmployee(employeeData);
      // Log desabilitado: Employee added
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso",
      });
    } catch (error) {
      // Log desabilitado: Error adding employee
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
      // Log desabilitado: Updating employee
      const updatedEmployee = await employeeService.updateEmployee(id, updates);
      // Log desabilitado: Employee updated
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
      });
    } catch (error) {
      // Log desabilitado: Error updating employee
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
      await employeeService.deleteEmployee(id);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      toast({
        title: "Sucesso",
        description: "Funcionário removido com sucesso",
      });
    } catch (error) {
      // Log desabilitado: Error deleting employee
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
      // Log desabilitado: Error filtering employees by unit
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
