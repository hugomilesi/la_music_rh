
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, NewEmployeeData } from '@/types/employee';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';

interface EmployeeContextType {
  employees: Employee[];
  filteredEmployees: Employee[];
  isLoading: boolean;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { toast } = useToast();

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar funcionários",
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
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === '' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const addEmployee = async (employeeData: NewEmployeeData) => {
    try {
      const newEmployee = await employeeService.createEmployee(employeeData);
      setEmployees(prev => [...prev, newEmployee]);
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso",
      });
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar funcionário",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, updates);
      setEmployees(prev => prev.map(emp => emp.id === id ? updatedEmployee : emp));
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar funcionário",
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
      console.error('Error deleting employee:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getEmployeesByUnit = (unit: string) => {
    return employees.filter(employee => employee.units.includes(unit as any));
  };

  const refreshEmployees = async () => {
    await loadEmployees();
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      filteredEmployees,
      isLoading,
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
