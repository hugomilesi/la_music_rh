import { supabase } from '../integrations/supabase/client';
import type { Incident } from '../types/incident';

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
          employee:employees!incidents_employee_id_fkey(id, name),
          reporter:employees!incidents_reporter_id_fkey(id, name)
        `)
        .order('incident_date', { ascending: false });

      if (error) throw error;

      return data?.map(incident => ({
        id: incident.id,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.name || '',
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.incident_date,
        reporterId: incident.reporter_id,
        reporterName: incident.reporter?.name || '',
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar incidentes:', error);
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
          employee:employees!incidents_employee_id_fkey(id, name),
          reporter:employees!incidents_reporter_id_fkey(id, name)
        `);

      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('incident_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('incident_date', filters.endDate);
      }

      query = query.order('incident_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(incident => ({
        id: incident.id,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.name || '',
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.incident_date,
        reporterId: incident.reporter_id,
        reporterName: incident.reporter?.name || '',
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar incidentes filtrados:', error);
      throw error;
    }
  },

  /**
   * Adiciona um novo incidente
   */
  async add(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    try {
      const insertData = {
        employee_id: incident.employeeId,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incident_date: incident.incidentDate,
        reporter_id: incident.reporterId,
        status: incident.status || 'aberto'
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert(insertData)
        .select(`
          *,
          employee:employees!incidents_employee_id_fkey(id, name),
          reporter:employees!incidents_reporter_id_fkey(id, name)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.name || '',
        type: data.type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.incident_date,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.name || '',
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao adicionar incidente:', error);
      throw error;
    }
  },

  /**
   * Atualiza um incidente existente
   */
  async update(id: string, incident: Partial<Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Incident> {
    try {
      const updateData: any = {};
      
      if (incident.type !== undefined) updateData.type = incident.type;
      if (incident.severity !== undefined) updateData.severity = incident.severity;
      if (incident.description !== undefined) updateData.description = incident.description;
      if (incident.incidentDate !== undefined) updateData.incident_date = incident.incidentDate;
      if (incident.employeeId !== undefined) updateData.employee_id = incident.employeeId;
      if (incident.reporterId !== undefined) updateData.reporter_id = incident.reporterId;
      if (incident.status !== undefined) updateData.status = incident.status;

      const { data, error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:employees!incidents_employee_id_fkey(id, name),
          reporter:employees!incidents_reporter_id_fkey(id, name)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.name || '',
        type: data.type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.incident_date,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.name || '',
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao atualizar incidente:', error);
      throw error;
    }
  },

  /**
   * Remove um incidente
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir incidente:', error);
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
        .select('type, severity, status, incident_date');

      if (error) throw error;

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
        // Count by type
        stats.byType[incident.type] = (stats.byType[incident.type] || 0) + 1;
        
        // Count by severity
        stats.bySeverity[incident.severity] = (stats.bySeverity[incident.severity] || 0) + 1;
        
        // Count by status
        stats.byStatus[incident.status] = (stats.byStatus[incident.status] || 0) + 1;
        
        // Count active (aberto + em_andamento) and resolved
        if (incident.status === 'aberto' || incident.status === 'em_andamento') {
          stats.active = (stats.active || 0) + 1;
        } else if (incident.status === 'resolvido') {
          stats.resolved = (stats.resolved || 0) + 1;
        }
        
        // Count by month
        const incidentDate = new Date(incident.incident_date);
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
      console.error('Erro ao buscar estatísticas de incidentes:', error);
      throw error;
    }
  },

  /**
   * Inscreve-se para atualizações em tempo real de incidentes
   */
  subscribeToChanges(callback: () => void) {
    // Create a unique channel name to avoid conflicts
    const channelName = `incidents-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, callback)
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};