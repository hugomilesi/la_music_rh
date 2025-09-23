import { supabase } from '@/integrations/supabase/client';
import type { Incident, IncidentStats } from '../types/incident';

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
          employee:users!employee_id(id, username),
          reporter:users!reported_by(id, username)
        `)
        .order('date_occurred', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(incident => ({
        id: incident.id,
        title: incident.title,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.username || '',
        type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.date_occurred,
        reporterId: incident.reported_by,
        reporterName: incident.reporter?.username || '',
        status: this.mapStatusFromDatabase(incident.status),
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca incidentes filtrados
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
          employee:users!employee_id(id, username),
          reporter:users!reported_by(id, username)
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
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('date_occurred', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date_occurred', filters.endDate);
      }

      query = query.order('date_occurred', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data?.map(incident => ({
        id: incident.id,
        title: incident.title,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.username || '',
        type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.date_occurred,
        reporterId: incident.reported_by,
        reporterName: incident.reporter?.username || '',
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mapeia status do frontend para o banco de dados
   */
  mapStatusToDatabase(status: string): string {
    const statusMap: Record<string, string> = {
      'ativo': 'open',
      'resolvido': 'resolved',
      'arquivado': 'closed'
    };
    return statusMap[status] || 'open';
  },

  /**
   * Mapeia status do banco de dados para o frontend
   */
  mapStatusFromDatabase(status: string): string {
    const statusMap: Record<string, string> = {
      'open': 'ativo',
      'in_progress': 'ativo',
      'resolved': 'resolvido',
      'closed': 'arquivado'
    };
    return statusMap[status] || 'ativo';
  },

  /**
   * Adiciona um novo incidente
   */
  async add(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          title: incident.title,
          employee_id: incident.employeeId,
          incident_type: incident.type,
          severity: incident.severity,
          description: incident.description,
          date_occurred: incident.incidentDate,
          reported_by: incident.reporterId,
          status: this.mapStatusToDatabase(incident.status || 'ativo')
        })
        .select(`
          *,
          employee:users!employee_id(id, username),
          reporter:users!reported_by(id, username)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || '',
        type: data.incident_type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.date_occurred,
        reporterId: data.reported_by,
        reporterName: data.reporter?.username || '',
        status: this.mapStatusFromDatabase(data.status),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
      
      if (incident.title !== undefined) updateData.title = incident.title;
      if (incident.employeeId !== undefined) updateData.employee_id = incident.employeeId;
      if (incident.type !== undefined) updateData.incident_type = incident.type;
      if (incident.severity !== undefined) updateData.severity = incident.severity;
      if (incident.description !== undefined) updateData.description = incident.description;
      if (incident.incidentDate !== undefined) updateData.date_occurred = incident.incidentDate;
      if (incident.reporterId !== undefined) updateData.reported_by = incident.reporterId;
      if (incident.status !== undefined) updateData.status = this.mapStatusToDatabase(incident.status);

      const { data, error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(id, username),
          reporter:users!reporter_id(id, username)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || '',
        type: data.incident_type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.date_occurred,
        reporterId: data.reported_by,
        reporterName: data.reporter?.username || '',
        status: this.mapStatusFromDatabase(data.status),
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
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
      const { data, error } = await supabase
        .from('incidents')
        .select('incident_type, severity, status, date_occurred');

      if (error) {
        throw error;
      }

      const stats: IncidentStats = {
        total: data?.length || 0,
        active: 0,
        resolved: 0,
        byType: {},
        bySeverity: {},
        byStatus: {},
        thisMonth: 0,
        lastMonth: 0
      };

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      data?.forEach(incident => {
        const incidentType = incident.incident_type;
        
        // Count by type
        stats.byType[incidentType] = (stats.byType[incidentType] || 0) + 1;
        
        // Count by severity
        stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1;
        
        // Count by status
        stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
        
        // Count active and resolved
        if (incident.status === 'open') {
          stats.active = (stats.active || 0) + 1;
        } else if (incident.status === 'resolved') {
          stats.resolved = (stats.resolved || 0) + 1;
        }
        
        // Count by month
        const incidentDate = new Date(incident.date_occurred);
        const incidentMonth = incidentDate.getMonth();
        const incidentYear = incidentDate.getFullYear();
        
        if (incidentMonth === currentMonth && incidentYear === currentYear) {
          stats.thisMonth++;
        } else if (incidentMonth === lastMonth && incidentYear === lastMonthYear) {
          stats.lastMonth++;
        }
      });

      return stats;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Inscreve-se para atualizações em tempo real de incidentes
   */
  subscribeToIncidents(callback: (payload: any) => void) {
    try {
      // Verifica se já existe um canal com o mesmo nome
      const existingChannel = supabase.getChannels().find(ch => ch.topic === 'incidents-changes');
      if (existingChannel) {
        console.warn('IncidentService: Canal já existe, removendo antes de criar novo...');
        supabase.removeChannel(existingChannel);
      }

      console.log('IncidentService: Inscrevendo-se para atualizações em tempo real...');
      const channel = supabase
        .channel('incidents-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'incidents'
          },
          (payload) => {
            try {
              callback(payload);
            } catch (error) {
              console.error('IncidentService: Erro no callback:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('IncidentService: Subscrição realizada com sucesso');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('IncidentService: Erro na subscrição do canal');
          }
        });

      return channel;
    } catch (error) {
      console.error('IncidentService: Erro ao criar subscrição:', error);
      throw error;
    }
  },

  /**
   * Remove inscrição de atualizações em tempo real de incidentes
   */
  unsubscribeFromIncidents(channel: any) {
    if (!channel) {
      console.warn('IncidentService: Tentativa de remover canal nulo');
      return;
    }

    try {
      console.log('IncidentService: Removendo inscrição de atualizações em tempo real...');
      
      // Primeiro tenta unsubscribe do canal
      if (typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
      
      // Depois remove o canal
      supabase.removeChannel(channel);
      
      console.log('IncidentService: Canal removido com sucesso');
    } catch (error) {
      console.error('IncidentService: Erro ao remover canal:', error);
      // Não re-throw o erro para não quebrar o cleanup
    }
  }
};