
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { incidentService } from '../services/incidentService';
import type { Incident, IncidentFilter, IncidentStats } from '../types/incident';
import { toast } from 'sonner';

interface IncidentsContextType {
  incidents: Incident[];
  loading: boolean;
  stats: IncidentStats | null;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIncident: (id: string, updates: Partial<Incident>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
  getFilteredIncidents: (filter: IncidentFilter) => Promise<Incident[]>;
  refreshIncidents: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

export const IncidentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IncidentStats | null>(null);

  const refreshIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAll();
      setIncidents(data);
    } catch (error) {
      console.error('Erro ao carregar incidentes:', error);
      toast.error('Erro ao carregar incidentes');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const statsData = await incidentService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  // Carrega incidentes ao montar o componente
  useEffect(() => {
    refreshIncidents();
    refreshStats();
  }, [refreshIncidents, refreshStats]);

  // Inscreve-se para atualizações em tempo real
  useEffect(() => {
    const subscription = incidentService.subscribeToChanges(() => {
      // Use the functions directly to avoid dependency issues
      refreshIncidents();
      refreshStats();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-subscription

  const addIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIncident = await incidentService.add(incident);
      setIncidents(prev => [newIncident, ...prev]);
      await refreshStats();
      toast.success('Incidente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar incidente:', error);
      toast.error('Erro ao adicionar incidente');
      throw error;
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      await incidentService.update(id, updates);
      setIncidents(prev => prev.map(incident => 
        incident.id === id ? { ...incident, ...updates } : incident
      ));
      await refreshStats();
      toast.success('Incidente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar incidente:', error);
      toast.error('Erro ao atualizar incidente');
      throw error;
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      await incidentService.delete(id);
      setIncidents(prev => prev.filter(incident => incident.id !== id));
      await refreshStats();
      toast.success('Incidente removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover incidente:', error);
      toast.error('Erro ao remover incidente');
      throw error;
    }
  };

  const getFilteredIncidents = async (filter: IncidentFilter) => {
    try {
      return await incidentService.getFiltered(filter);
    } catch (error) {
      console.error('Erro ao filtrar incidentes:', error);
      toast.error('Erro ao filtrar incidentes');
      return [];
    }
  };

  return (
    <IncidentsContext.Provider value={{
      incidents,
      loading,
      stats,
      addIncident,
      updateIncident,
      deleteIncident,
      getFilteredIncidents,
      refreshIncidents,
      refreshStats
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
