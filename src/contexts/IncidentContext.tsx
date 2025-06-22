
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Incident, IncidentStats, IncidentFilters } from '@/types/incident';

interface IncidentContextType {
  incidents: Incident[];
  stats: IncidentStats;
  filters: IncidentFilters;
  loading: boolean;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  setFilters: (filters: Partial<IncidentFilters>) => void;
  resetFilters: () => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

// Mock data
const mockIncidents: Incident[] = [
  {
    id: '1',
    employeeId: '1',
    employee: 'Fabio Magarinos da Silva',
    type: 'Atraso',
    severity: 'leve',
    description: 'Chegou 30 minutos atrasado sem justificativa',
    date: '2024-03-15',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'ativo',
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z'
  },
  {
    id: '2',
    employeeId: '2',
    employee: 'Luciano Nazario de Oliveira',
    type: 'Falta Injustificada',
    severity: 'moderado',
    description: 'Não compareceu ao trabalho sem comunicação prévia',
    date: '2024-03-10',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'resolvido',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z',
    resolvedBy: 'Admin',
    resolvedDate: '2024-03-12',
    resolution: 'Advertência verbal aplicada'
  },
  {
    id: '3',
    employeeId: '3',
    employee: 'Felipe Elias Carvalho',
    type: 'Comportamento Inadequado',
    severity: 'grave',
    description: 'Atendimento inadequado aos alunos relatado por pais',
    date: '2024-03-08',
    reporter: 'Aline Cristina Pessanha Faria',
    status: 'ativo',
    createdAt: '2024-03-08T08:00:00Z',
    updatedAt: '2024-03-08T08:00:00Z'
  }
];

const initialFilters: IncidentFilters = {
  searchTerm: '',
  severity: 'all',
  status: 'all',
  type: 'all',
  dateRange: {}
};

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filters, setFiltersState] = useState<IncidentFilters>(initialFilters);
  const [loading, setLoading] = useState(false);

  const calculateStats = (): IncidentStats => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return {
      total: incidents.length,
      active: incidents.filter(i => i.status === 'ativo').length,
      resolved: incidents.filter(i => i.status === 'resolvido').length,
      thisMonth: incidents.filter(i => {
        const incidentDate = new Date(i.date);
        return incidentDate.getMonth() === currentMonth && incidentDate.getFullYear() === currentYear;
      }).length
    };
  };

  const addIncident = (incidentData: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncident = (id: string, updates: Partial<Incident>) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === id 
        ? { ...incident, ...updates, updatedAt: new Date().toISOString() }
        : incident
    ));
  };

  const deleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(incident => incident.id !== id));
  };

  const setFilters = (newFilters: Partial<IncidentFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(initialFilters);
  };

  const stats = calculateStats();

  return (
    <IncidentContext.Provider value={{
      incidents,
      stats,
      filters,
      loading,
      addIncident,
      updateIncident,
      deleteIncident,
      setFilters,
      resetFilters
    }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};
