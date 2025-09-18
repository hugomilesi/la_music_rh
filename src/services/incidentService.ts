import { supabase } from '@/integrations/supabase/client';
import type { Incident, IncidentStats } from '../types/incident';

export const incidentService = {
  /**
   * Busca todos os incidentes
   */
  async getAll(): Promise<Incident[]> {
    try {
      console.log('IncidentService: Buscando todos os incidentes...');
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          employee:users!employee_id(id, username),
          reporter:users!reporter_id(id, username)
        `)
        .order('date_occurred', { ascending: false });

      if (error) {
        console.error('IncidentService: Erro ao buscar incidentes:', error);
        throw error;
      }

      console.log('IncidentService: Dados brutos dos incidentes:', data);

      return data?.map(incident => ({
        id: incident.id,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.username || '',
        type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.date_occurred,
        reporterId: incident.reporter_id,
        reporterName: incident.reporter?.username || '',
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      console.error('IncidentService: Erro em getAll:', error);
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
      console.log('IncidentService: Buscando incidentes filtrados:', filters);
      let query = supabase
        .from('incidents')
        .select(`
          *,
          employee:users!employee_id(id, username),
          reporter:users!reporter_id(id, username)
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
        console.error('IncidentService: Erro ao buscar incidentes filtrados:', error);
        throw error;
      }

      console.log('IncidentService: Dados dos incidentes filtrados:', data);

      return data?.map(incident => ({
        id: incident.id,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.username || '',
        type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.date_occurred,
        reporterId: incident.reporter_id,
        reporterName: incident.reporter?.username || '',
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      console.error('IncidentService: Erro em getFiltered:', error);
      throw error;
    }
  },

  /**
   * Adiciona um novo incidente
   */
  async add(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    try {
      console.log('IncidentService: Adicionando novo incidente:', incident);
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          employee_id: incident.employeeId,
          incident_type: incident.type,
          severity: incident.severity,
          description: incident.description,
          date_occurred: incident.incidentDate,
          reporter_id: incident.reporterId,
          status: incident.status || 'open'
        })
        .select(`
          *,
          employee:users!employee_id(id, username),
          reporter:users!reporter_id(id, username)
        `)
        .single();

      if (error) {
        console.error('IncidentService: Erro ao adicionar incidente:', error);
        throw error;
      }

      console.log('Added incident data:', data);

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || '',
        type: data.incident_type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.date_occurred,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.username || '',
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('IncidentService: Erro em add:', error);
      throw error;
    }
  },

  /**
   * Atualiza um incidente existente
   */
  async update(id: string, incident: Partial<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Incident> {
    try {
      console.log('IncidentService: Atualizando incidente:', id, incident);
      const updateData: any = {};
      
      if (incident.employeeId !== undefined) updateData.employee_id = incident.employeeId;
      if (incident.type !== undefined) updateData.incident_type = incident.type;
      if (incident.severity !== undefined) updateData.severity = incident.severity;
      if (incident.description !== undefined) updateData.description = incident.description;
      if (incident.incidentDate !== undefined) updateData.date_occurred = incident.incidentDate;
      if (incident.reporterId !== undefined) updateData.reporter_id = incident.reporterId;
      if (incident.status !== undefined) updateData.status = incident.status;

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
        console.error('IncidentService: Erro ao atualizar incidente:', error);
        throw error;
      }

      console.log('IncidentService: Dados do incidente atualizado:', data);

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || '',
        type: data.incident_type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.date_occurred,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.username || '',
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('IncidentService: Erro em update:', error);
      throw error;
    }
  },

  /**
   * Remove um incidente
   */
  async delete(id: string): Promise<void> {
    try {
      console.log('IncidentService: Deletando incidente:', id);
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('IncidentService: Erro ao deletar incidente:', error);
        throw error;
      }

      console.log('IncidentService: Incidente deletado com sucesso:', id);
    } catch (error) {
      console.error('IncidentService: Erro em delete:', error);
      throw error;
    }
  },

  /**
   * Busca estatísticas dos incidentes
   */
  async getStats(): Promise<IncidentStats> {
    try {
      console.log('IncidentService: Buscando estatísticas dos incidentes...');
      const { data, error } = await supabase
        .from('incidents')
        .select('incident_type, severity, status, date_occurred');

      if (error) {
        console.error('IncidentService: Erro ao buscar estatísticas:', error);
        throw error;
      }

      console.log('IncidentService: Dados das estatísticas encontrados:', data?.length || 0);

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
      console.error('IncidentService: Erro em getStats:', error);
      throw error;
    }
  },

  /**
   * Inscreve-se para atualizações em tempo real de incidentes
   */
  subscribeToIncidents(callback: (payload: any) => void) {
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
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Remove inscrição de atualizações em tempo real de incidentes
   */
  unsubscribeFromIncidents(channel: any) {
    console.log('IncidentService: Removendo inscrição de atualizações em tempo real...');
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('IncidentService: Erro ao remover canal:', error);
      }
    }
  }
};