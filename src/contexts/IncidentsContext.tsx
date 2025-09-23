
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { incidentService } from '../services/incidentService';
import type { Incident, IncidentFilter, IncidentStats } from '../types/incident';
import { toast } from 'sonner';
import ErrorBoundary from '../components/common/ErrorBoundary';

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
  const subscriptionRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const refreshIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAll();
      setIncidents(data);
    } catch (error) {
      // Log desabilitado: Erro ao carregar incidentes
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
      // Log desabilitado: Erro ao carregar estatísticas
    }
  }, []);

  // Carrega incidentes ao montar o componente
  useEffect(() => {
    refreshIncidents();
    refreshStats();
  }, [refreshIncidents, refreshStats]);

  // Inscreve-se para atualizações em tempo real
  useEffect(() => {
    // Evita múltiplas subscrições usando ref
    if (isSubscribedRef.current || subscriptionRef.current) {
      return;
    }

    const setupSubscription = async () => {
      try {
        isSubscribedRef.current = true;
        
        subscriptionRef.current = incidentService.subscribeToIncidents(() => {
          // Usa setTimeout para evitar problemas de re-render durante o callback
          setTimeout(() => {
            refreshIncidents();
            refreshStats();
          }, 0);
        });
      } catch (error) {
        console.error('Erro ao configurar subscrição:', error);
        isSubscribedRef.current = false;
      }
    };

    setupSubscription();
    
    return () => {
      if (subscriptionRef.current) {
        try {
          incidentService.unsubscribeFromIncidents(subscriptionRef.current);
        } catch (error) {
          console.error('Erro ao fazer cleanup da subscrição:', error);
        } finally {
          subscriptionRef.current = null;
          isSubscribedRef.current = false;
        }
      }
    };
  }, []); // Array vazio para executar apenas uma vez

  const addIncident = async (incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newIncident = await incidentService.add(incident);
      setIncidents(prev => [newIncident, ...prev]);
      await refreshStats();
      toast.success('Incidente adicionado com sucesso!');
    } catch (error) {
      // Log desabilitado: Erro ao adicionar incidente
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
      // Log desabilitado: Erro ao atualizar incidente
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
      // Log desabilitado: Erro ao remover incidente
      toast.error('Erro ao remover incidente');
      throw error;
    }
  };

  const getFilteredIncidents = async (filter: IncidentFilter) => {
    try {
      return await incidentService.getFiltered(filter);
    } catch (error) {
      // Log desabilitado: Erro ao filtrar incidentes
      toast.error('Erro ao filtrar incidentes');
      return [];
    }
  };

  const handleRealtimeError = (error: Error) => {
    console.error('Erro no realtime de incidentes:', error);
    // Tenta reconectar após um delay
    setTimeout(() => {
      if (!isSubscribedRef.current) {
        try {
          subscriptionRef.current = incidentService.subscribeToIncidents(() => {
            setTimeout(() => {
              refreshIncidents();
              refreshStats();
            }, 0);
          });
          isSubscribedRef.current = true;
        } catch (reconnectError) {
          console.error('Erro ao reconectar:', reconnectError);
        }
      }
    }, 5000);
  };

  return (
    <ErrorBoundary onError={handleRealtimeError}>
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
    </ErrorBoundary>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
};

export type { Incident, IncidentFilter, IncidentStats };
