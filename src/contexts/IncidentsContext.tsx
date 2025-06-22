
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Incident {
  id: number;
  employee: string;
  type: string;
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
  date: string;
  reporter: string;
  status: 'ativo' | 'resolvido' | 'arquivado';
}

interface IncidentsContextType {
  incidents: Incident[];
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (id: number, updates: Partial<Incident>) => void;
  deleteIncident: (id: number) => void;
  getFilteredIncidents: (filter: 'all' | 'active' | 'resolved' | 'thisMonth') => Incident[];
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

const mockIncidents: Incident[] = [
  {
    id: 1,
    employee: 'Fabio Magarinos da Silva',
    type: 'Atraso',
    severity: 'leve',
    description: 'Chegou 30 minutos atrasado sem justificativa',
    date: '2024-03-15',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'ativo'
  },
  {
    id: 2,
    employee: 'Luciano Nazario de Oliveira',
    type: 'Falta Injustificada',
    severity: 'moderado',
    description: 'Não compareceu ao trabalho sem comunicação prévia',
    date: '2024-03-10',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'resolvido'
  },
  {
    id: 3,
    employee: 'Felipe Elias Carvalho',
    type: 'Comportamento Inadequado',
    severity: 'grave',
    description: 'Atendimento inadequado aos alunos relatado por pais',
    date: '2024-03-08',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'ativo'
  }
];

export const IncidentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);

  const addIncident = (incident: Omit<Incident, 'id'>) => {
    const newIncident = {
      ...incident,
      id: Math.max(...incidents.map(i => i.id)) + 1
    };
    setIncidents(prev => [...prev, newIncident]);
  };

  const updateIncident = (id: number, updates: Partial<Incident>) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === id ? { ...incident, ...updates } : incident
    ));
  };

  const deleteIncident = (id: number) => {
    setIncidents(prev => prev.filter(incident => incident.id !== id));
  };

  const getFilteredIncidents = (filter: 'all' | 'active' | 'resolved' | 'thisMonth') => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    switch (filter) {
      case 'active':
        return incidents.filter(incident => incident.status === 'ativo');
      case 'resolved':
        return incidents.filter(incident => incident.status === 'resolvido');
      case 'thisMonth':
        return incidents.filter(incident => {
          const incidentDate = new Date(incident.date);
          return incidentDate.getMonth() === currentMonth && 
                 incidentDate.getFullYear() === currentYear;
        });
      default:
        return incidents;
    }
  };

  return (
    <IncidentsContext.Provider value={{
      incidents,
      addIncident,
      updateIncident,
      deleteIncident,
      getFilteredIncidents
    }}>
      {children}
    </IncidentsContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
};
