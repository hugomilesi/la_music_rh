import { supabase } from '@/integrations/supabase/client';
import type { Incident, IncidentStats } from '../types/incident';

// Força limpeza global ao carregar o módulo
const globalCleanup = () => {
  try {
    const allChannels = supabase.getChannels();
    allChannels.forEach(channel => {
      try {
        if (typeof channel.unsubscribe === 'function') {
          channel.unsubscribe();
        }
        supabase.removeChannel(channel);
      } catch (error) {
        // Ignora erros de limpeza inicial
      }
    });
  } catch (error) {
  }
};

// Executa limpeza global
globalCleanup();

export const incidentService = {
  /**
   * Busca todos os incidentes
   */
  async getAll(): Promise<Incident[]> {
    try {
      
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          employee:colaboradores!employee_id(
            id,
            nome,
            email,
            departamento
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log({
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao buscar incidentes: ${error.message}`);
      }


      // Mapear campos do banco para a interface frontend
      const mappedData = (data || []).map((incident, index) => {
        try {
          return {
            id: incident.id,
            title: incident.title,
            employeeId: incident.employee_id,
            employeeName: incident.employee?.nome || 'N/A',
            type: incident.incident_type,
            severity: incident.severity,
            description: incident.description,
            incidentDate: incident.date_occurred,
            reporterId: incident.reported_by,
            reporterName: '', // Pode ser preenchido com dados do reporter se necessário
            status: this.mapStatusFromDatabase(incident.status),
            createdAt: incident.created_at,
            updatedAt: incident.updated_at
          };
        } catch (mappingError) {
          throw mappingError;
        }
      });

      return mappedData;
    } catch (error) {
      
      // Verificar se é um erro específico que pode causar "2 logs"
      if (error instanceof Error) {
        if (error.message.includes('logs') || error.message.includes('2')) {
        }
      }
      
      throw error;
    }
  },

  /**
   * Busca incidentes com filtros
   */
  async getFiltered(filters: {
    employeeId?: string;
    type?: string;
    severity?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Incident[]> {
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          employee:colaboradores!employee_id(
            id,
            nome,
            email,
            departamento
          )
        `);

      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      if (filters.type) {
        query = query.eq('incident_type', filters.type);
      }

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.status) {
        query = query.eq('status', this.mapStatusToDatabase(filters.status));
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Mapear campos do banco para a interface frontend
      const mappedData = (data || []).map(incident => ({
        id: incident.id,
        title: incident.title,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.nome || 'N/A',
        type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.date_occurred,
        reporterId: incident.reported_by,
        reporterName: '', // Pode ser preenchido com dados do reporter se necessário
        status: this.mapStatusFromDatabase(incident.status),
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      }));

      return mappedData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mapeia status do frontend para o banco de dados
   */
  mapStatusToDatabase(status: string): string {
    const statusMap: { [key: string]: string } = {
      'aberto': 'open',
      'em_andamento': 'in_progress',
      'resolvido': 'resolved',
      'fechado': 'closed'
    };
    return statusMap[status] || status;
  },

  /**
   * Mapeia status do banco de dados para o frontend
   */
  mapStatusFromDatabase(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'aberto',
      'in_progress': 'em_andamento',
      'resolved': 'resolvido',
      'closed': 'fechado'
    };
    return statusMap[status] || status;
  },

  /**
   * Adiciona um novo incidente
   */
  async add(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    try {
      const incidentData = {
        employee_id: incident.employeeId,
        incident_type: incident.type,
        severity: incident.severity,
        status: this.mapStatusToDatabase(incident.status),
        title: incident.title,
        description: incident.description,
        location: incident.location || null,
        date_occurred: incident.incidentDate,
        reported_by: incident.reporterId,
        // Usar apenas campos que existem na tabela
        witnesses: incident.witnesses || null,
        evidence_files: incident.attachments || null, // Mapear attachments para evidence_files
        actions_taken: incident.immediateAction || null,
        follow_up_required: incident.followUpRequired || false,
        follow_up_date: incident.followUpDate || null,
        // Novos campos adicionados na migração
        immediate_action: incident.immediateAction || null,
        root_cause: incident.rootCause || null,
        corrective_actions: incident.correctiveActions || null,
        preventive_actions: incident.preventiveActions || null,
        cost_estimate: incident.costEstimate || null,
        investigation_notes: incident.investigationNotes || null
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert([incidentData])
        .select(`
          *,
          employee:colaboradores!employee_id(
            id,
            nome,
            email,
            departamento
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Mapear campos do banco para a interface frontend
        const mappedData = {
          id: data.id,
          title: data.title,
          employeeId: data.employee_id,
          employeeName: data.employee?.nome || 'N/A',
          type: data.incident_type,
          severity: data.severity,
          description: data.description,
          incidentDate: data.date_occurred,
          reporterId: data.reported_by,
          reporterName: '',
          status: this.mapStatusFromDatabase(data.status),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

      return mappedData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Atualiza um incidente existente
   */
  async update(id: string, incident: Partial<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Incident> {
    try {
      const updateData: any = {};

      if (incident.employeeId !== undefined) updateData.employee_id = incident.employeeId;
      if (incident.type !== undefined) updateData.incident_type = incident.type;
      if (incident.severity !== undefined) updateData.severity = incident.severity;
      if (incident.status !== undefined) updateData.status = this.mapStatusToDatabase(incident.status);
      if (incident.title !== undefined) updateData.title = incident.title;
      if (incident.description !== undefined) updateData.description = incident.description;
      if (incident.location !== undefined) updateData.location = incident.location;
      if (incident.dateOccurred !== undefined) updateData.date_occurred = incident.dateOccurred;
      if (incident.reportedBy !== undefined) updateData.reported_by = incident.reportedBy;
      if (incident.witnesses !== undefined) updateData.witnesses = incident.witnesses;
      if (incident.immediateAction !== undefined) updateData.immediate_action = incident.immediateAction;
      if (incident.rootCause !== undefined) updateData.root_cause = incident.rootCause;
      if (incident.correctiveActions !== undefined) updateData.corrective_actions = incident.correctiveActions;
      if (incident.preventiveActions !== undefined) updateData.preventive_actions = incident.preventiveActions;
      if (incident.followUpRequired !== undefined) updateData.follow_up_required = incident.followUpRequired;
      if (incident.followUpDate !== undefined) updateData.follow_up_date = incident.followUpDate;
      if (incident.attachments !== undefined) updateData.attachments = incident.attachments;
      if (incident.costEstimate !== undefined) updateData.cost_estimate = incident.costEstimate;
      if (incident.investigationNotes !== undefined) updateData.investigation_notes = incident.investigationNotes;

      const { data, error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:colaboradores(
            id,
            nome,
            email,
            departamento
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Mapear campos do banco para a interface frontend
        const mappedData = {
          id: data.id,
          title: data.title,
          employeeId: data.employee_id,
          employeeName: data.employee?.nome || '',
          type: data.incident_type,
          severity: data.severity,
          description: data.description,
          incidentDate: data.date_occurred,
          reporterId: data.reported_by,
          reporterName: '',
          status: this.mapStatusFromDatabase(data.status),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

      return mappedData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove um incidente
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca estatísticas dos incidentes
   */
  async getStats(): Promise<IncidentStats> {
    try {
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('status, severity, incident_type, created_at');

      if (error) {
        throw error;
      }

      const stats: IncidentStats = {
        total: incidents?.length || 0,
        byStatus: {
          aberto: 0,
          em_andamento: 0,
          resolvido: 0,
          fechado: 0
        },
        bySeverity: {
          baixa: 0,
          media: 0,
          alta: 0,
          critica: 0
        },
        byType: {},
        thisMonth: 0,
        lastMonth: 0,
        trend: 0
      };

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      incidents?.forEach(incident => {
        // Status
        const mappedStatus = this.mapStatusFromDatabase(incident.status);
        if (mappedStatus in stats.byStatus) {
          stats.byStatus[mappedStatus as keyof typeof stats.byStatus]++;
        }

        // Severity
        if (incident.severity in stats.bySeverity) {
          stats.bySeverity[incident.severity as keyof typeof stats.bySeverity]++;
        }

        // Type
        if (incident.incident_type) {
          stats.byType[incident.incident_type] = (stats.byType[incident.incident_type] || 0) + 1;
        }

        // Monthly stats
        const incidentDate = new Date(incident.created_at);
        if (incidentDate >= thisMonth) {
          stats.thisMonth++;
        } else if (incidentDate >= lastMonth && incidentDate <= lastMonthEnd) {
          stats.lastMonth++;
        }
      });

      // Calculate trend
      if (stats.lastMonth > 0) {
        stats.trend = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100;
      } else if (stats.thisMonth > 0) {
        stats.trend = 100;
      }

      return stats;
    } catch (error) {
      throw error;
    }
  },

  // Sistema de subscrição simplificado
  _activeChannel: null as any,
  _isSubscribing: false,
  _subscriptionCallbacks: new Set<(payload: any) => void>(),
  _subscriptionId: null as string | null,

  /**
   * Subscreve para atualizações em tempo real de incidentes
   */
  subscribeToIncidents(callback: (payload: any) => void) {
    try {
      
      // FORÇA limpeza completa antes de qualquer nova subscrição
      this.forceCleanupChannels();
      
      // Aguarda um pouco para garantir limpeza
      setTimeout(() => {
        // Adiciona o callback à lista
        this._subscriptionCallbacks.add(callback);
        
        // Verifica se já existe canal ativo APÓS limpeza
        if (this._activeChannel && this._subscriptionId && !this._isSubscribing) {
          return this._activeChannel;
        }
        
        // Se já está tentando se inscrever, apenas aguarda
        if (this._isSubscribing) {
          return null;
        }
        
        // Inicia nova subscrição
        return this._createSubscription();
      }, 100);
      
      return null;
    } catch (error) {
      this._subscriptionCallbacks.delete(callback);
      return null;
    }
  },

  /**
   * Cria uma nova subscrição
   */
  _createSubscription() {
    if (this._isSubscribing) {
      return null;
    }

    this._isSubscribing = true;
    const subscriptionId = `incidents-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Limpa canais existentes primeiro
    this._cleanupExistingChannels();

    try {
      // Cria novo canal
      const channel = supabase
        .channel(subscriptionId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'incidents'
          },
          (payload) => {
            // Notifica todos os callbacks registrados
            this._subscriptionCallbacks.forEach(callback => {
              try {
                callback(payload);
              } catch (error) {
              }
            });
          }
        )
        .subscribe((status) => {
          
          if (status === 'SUBSCRIBED') {
            this._activeChannel = channel;
            this._subscriptionId = subscriptionId;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this._cleanup();
          }
          
          this._isSubscribing = false;
        });

      return channel;
    } catch (error) {
      this._isSubscribing = false;
      return null;
    }
  },

  /**
   * Limpa canais existentes
   */
  _cleanupExistingChannels() {
    if (this._activeChannel) {
      try {
        supabase.removeChannel(this._activeChannel);
      } catch (error) {
      }
      this._activeChannel = null;
    }
  },

  /**
   * Limpa o estado da subscrição
   */
  _cleanup() {
    this._activeChannel = null;
    this._subscriptionId = null;
    this._isSubscribing = false;
    this._subscriptionCallbacks.clear();
  },



  /**
   * Remove subscrição
   */
  unsubscribeFromIncidents(callback?: (payload: any) => void) {
    try {
      
      // Remove callback específico se fornecido
      if (callback) {
        this._subscriptionCallbacks.delete(callback);
        
        // Se ainda há callbacks, não remove o canal
        if (this._subscriptionCallbacks.size > 0) {
          return;
        }
      }
      
      // Remove canal ativo
      if (this._activeChannel) {
        supabase.removeChannel(this._activeChannel);
      }
      
      // Limpa estado
      this._cleanup();
      
    } catch (error) {
      this._cleanup();
    }
  },

  /**
   * Força a limpeza completa de todas as subscrições
   */
  forceCleanup() {
    this.clearReconnectTimeout();
    this.forceCleanupChannels();
    this.unsubscribeFromIncidents();
    
    // Aguarda um pouco e força limpeza novamente para garantir
    setTimeout(() => {
      this.forceCleanupChannels();
    }, 50);
    
  },

  // Variáveis para reconexão
  _reconnectTimeout: null as any,
  _reconnectAttempts: 0,
  _maxReconnectAttempts: 5,
  _isOnline: true,
  _lastConnectionTime: null as Date | null,

  /**
   * Força a limpeza COMPLETA de todos os canais existentes
   */
  forceCleanupChannels() {
    try {
      
      // Remove TODOS os canais do Supabase
      const allChannels = supabase.getChannels();
      
      allChannels.forEach((channel, index) => {
        try {
          if (typeof channel.unsubscribe === 'function') {
            channel.unsubscribe();
          }
          supabase.removeChannel(channel);
        } catch (error) {
        }
      });
      
      // Limpa estado interno
      this._cleanup();
      
    } catch (error) {
    }
  },

  /**
   * Configura sistema de reconexão
   */
  setupReconnectionSystem(callback: (payload: any) => void) {
    this.setupConnectivityMonitoring();
    
    // Inicia tentativas de reconexão
    this.attemptReconnection(callback);
  },

  setupConnectivityMonitoring() {
    window.addEventListener('online', () => {
      this._isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this._isOnline = false;
    });
    
    this._isOnline = navigator.onLine;
  },

  attemptReconnection(callback: (payload: any) => void) {
    if (!this._isOnline || this._reconnectAttempts >= this._maxReconnectAttempts) {
      return;
    }
    
    this._reconnectAttempts++;
    const delay = this.calculateBackoffDelay(this._reconnectAttempts);
    
    
    this._reconnectTimeout = setTimeout(() => {
      this.performReconnection(callback);
    }, delay);
  },

  calculateBackoffDelay(attempt: number): number {
    // Exponential backoff com jitter
    const baseDelay = 1000;
    const maxDelay = 30000; // Máximo de 30 segundos
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // Adiciona jitter para evitar thundering herd
    const jitter = Math.random() * 0.3 * delay;
    return delay + jitter;
  },

  async performReconnection(callback: (payload: any) => void) {
    try {
      
      // Limpa conexões existentes
      this.unsubscribeFromIncidents();
      
      // Aguarda um pouco antes de reconectar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenta reconectar
      const channel = this.subscribeToIncidents(callback);
      
      if (channel) {
        this._reconnectAttempts = 0; // Reset tentativas em caso de sucesso
        this._lastConnectionTime = new Date();
      } else {
        throw new Error('Falha ao criar canal de reconexão');
      }
    } catch (error) {
      
      // Tenta novamente se não atingiu o limite
      if (this._reconnectAttempts < this._maxReconnectAttempts) {
        this.attemptReconnection(callback);
      }
    }
  },

  clearReconnectTimeout() {
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
      this._reconnectTimeout = null;
    }
  },

  /**
   * Retorna o status da conexão
   */
  getConnectionStatus() {
    return {
      hasActiveChannel: !!this._activeChannel,
      subscriptionId: this._subscriptionId,
      reconnectAttempts: this._reconnectAttempts,
      maxReconnectAttempts: this._maxReconnectAttempts,
      isOnline: this._isOnline,
      isSubscribing: this._isSubscribing,
      lastConnectionTime: this._lastConnectionTime,
      activeCallbacks: this._subscriptionCallbacks.size,
      allChannels: supabase.getChannels().length,
      incidentChannels: supabase.getChannels().filter(ch => 
        ch.topic.startsWith('incidents-') || ch.topic === 'incidents'
      ).length
    };
  },

  /**
   * Limpa subscrições órfãs
   */
  cleanupOrphanedSubscriptions() {
    try {

      const allChannels = supabase.getChannels();
      const incidentChannels = allChannels.filter(ch => 
        ch.topic.startsWith('incidents-') || ch.topic === 'incidents'
      );

      
      // Se há múltiplos canais ou canais sem referência ativa
      if (incidentChannels.length > 1 || (incidentChannels.length > 0 && !this._activeChannel)) {

        incidentChannels.forEach((channel, index) => {
          try {
            if (typeof channel.unsubscribe === 'function') {
              channel.unsubscribe();
            }
            supabase.removeChannel(channel);
          } catch (error) {
          }
        });

        // Reset do estado se não há canal ativo
        if (!this._activeChannel) {
          this._subscriptionId = null;
          this._isSubscribing = false;
        }
      }
      
    } catch (error) {
    }
  },

  /**
   * Força reconexão manual
   */
  forceReconnect(callback: (payload: any) => void) {
    this._reconnectAttempts = 0; // Reset tentativas
    this.clearReconnectTimeout();
    this.performReconnection(callback);
  },

  /**
   * Debug do estado das subscrições
   */
  debugSubscriptionState() {
    const allChannels = supabase.getChannels();
    const incidentChannels = allChannels.filter(ch => 
      ch.topic.startsWith('incidents-') || ch.topic === 'incidents'
    );
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      activeChannel: {
        exists: !!this._activeChannel,
        topic: this._activeChannel?.topic || null,
        state: this._activeChannel?.state || null
      },
      subscriptionControl: {
        subscriptionId: this._subscriptionId,
        isSubscribing: this._isSubscribing,
        callbacksCount: this._subscriptionCallbacks.size
      },
      channels: {
        totalChannels: allChannels.length,
        incidentChannels: incidentChannels.length,
        channelTopics: allChannels.map(ch => ch.topic),
        incidentChannelDetails: incidentChannels.map(ch => ({
          topic: ch.topic,
          state: ch.state,
          joinRef: ch.joinRef
        }))
      },
      connection: {
        isOnline: this._isOnline,
        reconnectAttempts: this._reconnectAttempts,
        maxReconnectAttempts: this._maxReconnectAttempts,
        lastConnectionTime: this._lastConnectionTime,
        hasReconnectTimeout: !!this._reconnectTimeout
      }
    };
    
    
    // Análise de problemas
    const issues = [];
    
    if (incidentChannels.length > 1) {
      issues.push(`⚠️ Múltiplos canais detectados: ${incidentChannels.length}`);
    }
    
    if (this._isSubscribing && this._activeChannel) {
      issues.push('⚠️ Flag isSubscribing ativa mas canal já existe');
    }
    
    if (!this._activeChannel && this._subscriptionId) {
      issues.push('⚠️ ID de subscrição existe mas canal não');
    }
    
    if (issues.length > 0) {
      issues.forEach(issue => console.warn(issue));
    } else {
    }
    
    
    return debugInfo;
  }
};

// Disponibiliza debug no desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugIncidentService = () => incidentService.debugSubscriptionState();
}

// Cleanup ao descarregar a página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => incidentService.forceCleanup());
}