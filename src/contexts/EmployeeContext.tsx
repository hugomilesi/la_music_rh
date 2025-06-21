import React, { createContext, useContext, useState, useCallback } from 'react';
import { Employee, NewEmployeeData } from '@/types/employee';
import { Unit } from '@/types/unit';

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
  getEmployeesForUnits: (units: Unit[]) => Employee[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

// Updated mock data with music school context
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Ana Carolina Santos',
    email: 'ana.santos@lamusic.com',
    phone: '(21) 99999-9999',
    position: 'Professor de Piano',
    department: 'Educação Musical',
    units: [Unit.CAMPO_GRANDE, Unit.RECREIO],
    startDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Bruno Silva Costa',
    email: 'bruno.costa@lamusic.com',
    phone: '(21) 98888-8888',
    position: 'Técnico de Som',
    department: 'Produção Musical',
    units: [Unit.BARRA],
    startDate: '2024-02-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Carla Fernanda Lima',
    email: 'carla.lima@lamusic.com',
    phone: '(21) 97777-7777',
    position: 'Coordenadora Pedagógica',
    department: 'Coordenação',
    units: [Unit.CAMPO_GRANDE, Unit.BARRA, Unit.RECREIO],
    startDate: '2024-01-20',
    status: 'active'
  },
  {
    id: '4',
    name: 'Diego Oliveira Rocha',
    email: 'diego.rocha@lamusic.com',
    phone: '(21) 96666-6666',
    position: 'Professor de Violão',
    department: 'Educação Musical',
    units: [Unit.RECREIO],
    startDate: '2024-03-10',
    status: 'active'
  },
  {
    id: '5',
    name: 'Elena Martins Souza',
    email: 'elena.souza@lamusic.com',
    phone: '(21) 95555-5555',
    position: 'Recepcionista',
    department: 'Atendimento',
    units: [Unit.CAMPO_GRANDE],
    startDate: '2024-02-15',
    status: 'inactive'
  },
  {
    id: '6',
    name: 'Felipe Santos Barbosa',
    email: 'felipe.barbosa@lamusic.com',
    phone: '(21) 94444-4444',
    position: 'Professor de Bateria',
    department: 'Educação Musical',
    units: [Unit.BARRA, Unit.RECREIO],
    startDate: '2024-01-30',
    status: 'active'
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
