
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  unit?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
}

// Mock contacts data - in a real app this would come from your employee database
export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '+5511999999999',
    email: 'ana.silva@empresa.com',
    unit: 'São Paulo',
    role: 'Gerente de Vendas',
    department: 'Comercial',
    isActive: true
  },
  {
    id: '2',
    name: 'Carlos Santos',
    phone: '+5511888888888',
    email: 'carlos.santos@empresa.com',
    unit: 'Rio de Janeiro',
    role: 'Analista de RH',
    department: 'Recursos Humanos',
    isActive: true
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    phone: '+5511777777777',
    email: 'maria.oliveira@empresa.com',
    unit: 'Belo Horizonte',
    role: 'Desenvolvedora',
    department: 'Tecnologia',
    isActive: true
  },
  {
    id: '4',
    name: 'João Costa',
    phone: '+5511666666666',
    email: 'joao.costa@empresa.com',
    unit: 'São Paulo',
    role: 'Coordenador de Marketing',
    department: 'Marketing',
    isActive: true
  },
  {
    id: '5',
    name: 'Lucia Ferreira',
    phone: '+5511555555555',
    email: 'lucia.ferreira@empresa.com',
    unit: 'Porto Alegre',
    role: 'Analista Financeiro',
    department: 'Financeiro',
    isActive: true
  },
  {
    id: '6',
    name: 'Pedro Almeida',
    phone: '+5511444444444',
    email: 'pedro.almeida@empresa.com',
    unit: 'Salvador',
    role: 'Supervisor de Produção',
    department: 'Operações',
    isActive: true
  },
  {
    id: '7',
    name: 'Fernanda Lima',
    phone: '+5511333333333',
    email: 'fernanda.lima@empresa.com',
    unit: 'Recife',
    role: 'Consultora de Vendas',
    department: 'Comercial',
    isActive: true
  },
  {
    id: '8',
    name: 'Roberto Silva',
    phone: '+5511222222222',
    email: 'roberto.silva@empresa.com',
    unit: 'Brasília',
    role: 'Gerente de Projetos',
    department: 'Tecnologia',
    isActive: true
  }
];

export const getContacts = (): Contact[] => {
  return mockContacts.filter(contact => contact.isActive);
};

export const searchContacts = (query: string): Contact[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockContacts.filter(contact => 
    contact.isActive && (
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.phone.includes(query) ||
      contact.email?.toLowerCase().includes(lowercaseQuery) ||
      contact.unit?.toLowerCase().includes(lowercaseQuery) ||
      contact.role?.toLowerCase().includes(lowercaseQuery)
    )
  );
};

export const getContactByPhone = (phone: string): Contact | undefined => {
  return mockContacts.find(contact => contact.phone === phone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add +55 if not present and number starts with 11
  if (cleaned.length === 11 && cleaned.startsWith('11')) {
    return `+55${cleaned}`;
  }
  
  // If already has country code
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    return `+${cleaned}`;
  }
  
  // Return as is if already formatted
  if (phone.startsWith('+')) {
    return phone;
  }
  
  return `+55${cleaned}`;
};
