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

// Updated with real music school staff data
const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Aline Cristina Pessanha Faria',
    email: 'aline.faria@lamusic.com',
    phone: '(21) 99999-9999',
    position: 'Coordenadora',
    department: 'Coordenação',
    units: [Unit.CAMPO_GRANDE, Unit.BARRA, Unit.RECREIO],
    startDate: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Felipe Elias Carvalho',
    email: 'felipe.carvalho@lamusic.com',
    phone: '(21) 98888-8888',
    position: 'Professor de Violão e Guitarra',
    department: 'Educação Musical',
    units: [Unit.CAMPO_GRANDE],
    startDate: '2024-02-01',
    status: 'active'
  },
  {
    id: '3',
    name: 'Luciano Nazario de Oliveira',
    email: 'luciano.oliveira@lamusic.com',
    phone: '(21) 97777-7777',
    position: 'Professor de Bateria',
    department: 'Educação Musical',
    units: [Unit.CAMPO_GRANDE],
    startDate: '2024-01-20',
    status: 'active'
  },
  {
    id: '4',
    name: 'Fabio Magarinos da Silva',
    email: 'fabio.silva@lamusic.com',
    phone: '(21) 96666-6666',
    position: 'Professor de Baixo',
    department: 'Educação Musical',
    units: [Unit.CAMPO_GRANDE],
    startDate: '2024-03-10',
    status: 'active'
  },
  {
    id: '5',
    name: 'Fabiana Candido de Assis Silva',
    email: 'fabiana.silva@lamusic.com',
    phone: '(21) 95555-5555',
    position: 'Professora de Canto',
    department: 'Educação Musical',
    units: [Unit.CAMPO_GRANDE],
    startDate: '2024-02-15',
    status: 'active'
  },
  {
    id: '6',
    name: 'Igor Esteves Alves Baiao',
    email: 'igor.baiao@lamusic.com',
    phone: '(21) 94444-4444',
    position: 'Professor de Violão e Guitarra',
    department: 'Educação Musical',
    units: [Unit.BARRA],
    startDate: '2024-01-30',
    status: 'active'
  },
  {
    id: '7',
    name: 'Luana de Menezes Vieira',
    email: 'luana.vieira@lamusic.com',
    phone: '(21) 93333-3333',
    position: 'Professora de Teclado',
    department: 'Educação Musical',
    units: [Unit.BARRA],
    startDate: '2024-03-05',
    status: 'active'
  },
  {
    id: '8',
    name: 'Marcelo Vieira Soares',
    email: 'marcelo.soares@lamusic.com',
    phone: '(21) 92222-2222',
    position: 'Professor de Bateria',
    department: 'Educação Musical',
    units: [Unit.BARRA],
    startDate: '2024-02-20',
    status: 'active'
  },
  {
    id: '9',
    name: 'Jessica Balbino da Silva',
    email: 'jessica.silva@lamusic.com',
    phone: '(21) 91111-1111',
    position: 'Professora de Canto',
    department: 'Educação Musical',
    units: [Unit.BARRA],
    startDate: '2024-04-01',
    status: 'active'
  },
  {
    id: '10',
    name: 'Douglas Carvalho de Azevedo',
    email: 'douglas.azevedo@lamusic.com',
    phone: '(21) 90000-0000',
    position: 'Professor de Violão e Guitarra',
    department: 'Educação Musical',
    units: [Unit.RECREIO],
    startDate: '2024-03-15',
    status: 'active'
  },
  {
    id: '11',
    name: 'Denilson Macedo de Araujo',
    email: 'denilson.araujo@lamusic.com',
    phone: '(21) 89999-9999',
    position: 'Professor de Teclado',
    department: 'Educação Musical',
    units: [Unit.RECREIO],
    startDate: '2024-02-10',
    status: 'active'
  },
  {
    id: '12',
    name: 'Breno Elias de Carvalho',
    email: 'breno.carvalho@lamusic.com',
    phone: '(21) 88888-8888',
    position: 'Professor de Bateria',
    department: 'Educação Musical',
    units: [Unit.RECREIO],
    startDate: '2024-01-25',
    status: 'active'
  },
  {
    id: '13',
    name: 'Ayla de Souza Nunes',
    email: 'ayla.nunes@lamusic.com',
    phone: '(21) 87777-7777',
    position: 'Professora de Canto',
    department: 'Educação Musical',
    units: [Unit.RECREIO],
    startDate: '2024-03-20',
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
