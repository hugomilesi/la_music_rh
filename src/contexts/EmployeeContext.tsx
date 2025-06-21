
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Employee, NewEmployeeData } from '@/types/employee';

interface EmployeeContextType {
  employees: Employee[];
  filteredEmployees: Employee[];
  searchTerm: string;
  departmentFilter: string;
  statusFilter: string;
  isLoading: boolean;
  addEmployee: (data: NewEmployeeData) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (department: string) => void;
  setStatusFilter: (status: string) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Mock data for demonstration
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@lamusic.com',
    phone: '(11) 99999-9999',
    position: 'Segurança',
    department: 'Operações',
    startDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@lamusic.com',
    phone: '(11) 88888-8888',
    position: 'Bartender',
    department: 'Bar',
    startDate: '2024-02-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro.costa@lamusic.com',
    phone: '(11) 77777-7777',
    position: 'DJ',
    department: 'Entretenimento',
    startDate: '2024-01-20',
    status: 'inactive'
  }
];

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === '' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const addEmployee = useCallback((data: NewEmployeeData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newEmployee: Employee = {
        ...data,
        id: Date.now().toString(),
        status: 'active'
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...data } : emp));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  }, []);

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
      setStatusFilter
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
