
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
  const providerIdRef = useRef(`provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  console.log('IncidentsProvider: [INIT] Inicializando provider com ID:', providerIdRef.current);

  const refreshIncidents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('IncidentsContext: Carregando incidentes...');
      const data = await incidentService.getAll();
      console.log('IncidentsContext: Incidentes carregados:', data.length, 'items');
      console.log('IncidentsContext: Primeiro incidente (debug):', data[0]);
      setIncidents(data);
    } catch (error) {
      console.error('IncidentsContext: Erro ao carregar incidentes:', error);
      toast.error('Erro ao carregar incidentes');
      setIncidents([]);
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

  const handleRealtimeUpdate = useCallback(() => {
    setTimeout(() => {
      refreshIncidents();
      refreshStats();
    }, 0);
  }, [refreshIncidents, refreshStats]);

  const handleRealtimeError = useCallback(() => {
    console.log('IncidentsContext: Erro na conexão em tempo real, iniciando sistema robusto de reconexão...');
    
    // Força limpeza completa
    incidentService.forceCleanup();
    subscriptionRef.current = null;
    isSubscribedRef.current = false;
    
    // Usa o sistema robusto de reconexão
    incidentService.setupReconnectionSystem(handleRealtimeUpdate);
  }, [handleRealtimeUpdate]);

  // Carrega incidentes ao montar o componente
  useEffect(() => {
    refreshIncidents();
    refreshStats();
  }, [refreshIncidents, refreshStats]);

  useEffect(() => {
    let isMounted = true;
    
    const initializeSubscription = async () => {
      if (!isSubscribedRef.current && isMounted) {
        try {
          console.log(`IncidentsProvider: [${providerIdRef.current}] Iniciando subscrição em tempo real...`);
          
          // FORÇA limpeza COMPLETA antes de qualquer coisa
          console.log(`IncidentsProvider: [${providerIdRef.current}] Forçando limpeza COMPLETA...`);
          incidentService.forceCleanupChannels();
          incidentService.forceCleanup();
          
          // Aguarda mais tempo para garantir que a limpeza foi concluída
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (!isMounted) {
            console.log(`IncidentsProvider: [${providerIdRef.current}] Componente desmontado durante inicialização`);
            return;
          }
          
          // Configura monitoramento de conectividade
          incidentService.setupConnectivityMonitoring();
          
          console.log(`IncidentsProvider: [${providerIdRef.current}] Criando subscrição...`);
          
          // Aguarda mais um pouco antes de criar subscrição
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Inicia subscrição
          const channel = incidentService.subscribeToIncidents(handleRealtimeUpdate);
          
          if (channel && isMounted) {
            subscriptionRef.current = channel;
            isSubscribedRef.current = true;
            
            console.log(`IncidentsProvider: [${providerIdRef.current}] Subscrição criada com sucesso`);
          } else {
            console.warn(`IncidentsProvider: [${providerIdRef.current}] Falha ao criar canal de subscrição`);
          }
        } catch (error) {
          console.error(`IncidentsProvider: [${providerIdRef.current}] Erro ao iniciar subscrição:`, error);
          if (isMounted) {
            handleRealtimeError();
          }
        }
      } else {
        console.log(`IncidentsProvider: [${providerIdRef.current}] Subscrição ignorada - já ativa ou componente desmontado`);
      }
    };
    
    initializeSubscription();

    return () => {
      isMounted = false;
      console.log(`IncidentsProvider: [${providerIdRef.current}] Executando cleanup COMPLETO...`);
      
      // FORÇA limpeza COMPLETA múltiplas vezes
      incidentService.forceCleanupChannels();
      incidentService.forceCleanup();
      
      // Aguarda e força novamente
      setTimeout(() => {
        incidentService.forceCleanupChannels();
      }, 50);
      
      subscriptionRef.current = null;
      isSubscribedRef.current = false;
      
      console.log(`IncidentsProvider: [${providerIdRef.current}] Cleanup COMPLETO finalizado`);
    };
  }, [handleRealtimeUpdate, handleRealtimeError]);

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
