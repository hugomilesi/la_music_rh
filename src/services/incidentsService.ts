import { supabase } from '@/integrations/supabase/client';
import { Incident, CreateIncidentData, UpdateIncidentData, IncidentStats, IncidentFilter } from '@/types/incidents';

export const incidentsService = {
  async getIncidents(filter?: IncidentFilter): Promise<Incident[]> {
    try {
      // Log desabilitado: Getting incidents
      
      let query = supabase
        .from('incidents')
        .select(`
          *,
          employee:users!employee_id(full_name),
        reporter:users!reporter_id(full_name)
        `)
        .order('incident_date', { ascending: false });
      
      // Apply filters
      if (filter) {
        if (filter.employeeId) {
          query = query.eq('employee_id', filter.employeeId);
        }
        if (filter.type) {
          query = query.eq('type', filter.type);
        }
        if (filter.severity) {
          query = query.eq('severity', filter.severity);
        }
        if (filter.status) {
          query = query.eq('status', filter.status);
        }
        if (filter.dateFrom) {
          query = query.gte('incident_date', filter.dateFrom);
        }
        if (filter.dateTo) {
          query = query.lte('incident_date', filter.dateTo);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        // Log desabilitado: Error getting incidents
        throw error;
      }
      
      // Incidents fetch success logging disabled
      
      return data.map(incident => ({
        id: incident.id,
        employeeId: incident.employee_id,
        employeeName: incident.employee?.full_name || 'Funcionário não encontrado',
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.incident_date,
        reporterId: incident.reporter_id,
        reporterName: incident.reporter?.name || null,
        status: incident.status,
        createdAt: incident.created_at,
        updatedAt: incident.updated_at
      }));
    } catch (error) {
      // Error in getIncidents logging disabled
      throw error;
    }
  },

  async getIncidentById(id: number): Promise<Incident> {
    try {
      // Incident by ID fetching logging disabled
      
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          employee:users!employee_id(full_name),
        reporter:users!reporter_id(full_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        // Error fetching incident logging disabled
        throw error;
      }
      
      // Incident fetch success logging disabled
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.full_name || 'Funcionário não encontrado',
        type: data.type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.incident_date,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.name || null,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      // Error in getIncidentById logging disabled
      throw error;
    }
  },

  async createIncident(incidentData: CreateIncidentData): Promise<Incident> {
    try {
      // Log desabilitado: Creating incident
      
      const { data, error } = await supabase
        .from('incidents')
        .insert({
          employee_id: incidentData.employeeId,
          type: incidentData.type,
          severity: incidentData.severity,
          description: incidentData.description,
          incident_date: incidentData.incidentDate,
          reporter_id: incidentData.reporterId || null,
          status: incidentData.status || 'ativo'
        })
        .select(`
          *,
          employee:users!employee_id(full_name),
        reporter:users!reporter_id(full_name)
        `)
        .single();
      
      if (error) {
        // Log desabilitado: Error creating incident
        throw error;
      }
      
      // Incident creation success logging disabled
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.full_name || 'Funcionário não encontrado',
        type: data.type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.incident_date,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.name || null,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      // Error in createIncident logging disabled
      throw error;
    }
  },

  async updateIncident(id: number, updateData: UpdateIncidentData): Promise<Incident> {
    try {
      // Log desabilitado: Updating incident
      
      const dbUpdateData: any = {};
      
      if (updateData.type !== undefined) dbUpdateData.type = updateData.type;
      if (updateData.severity !== undefined) dbUpdateData.severity = updateData.severity;
      if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
      if (updateData.incidentDate !== undefined) dbUpdateData.incident_date = updateData.incidentDate;
      if (updateData.reporterId !== undefined) dbUpdateData.reporter_id = updateData.reporterId;
      if (updateData.status !== undefined) dbUpdateData.status = updateData.status;
      
      const { data, error } = await supabase
        .from('incidents')
        .update(dbUpdateData)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(full_name),
        reporter:users!reporter_id(full_name)
        `)
        .single();
      
      if (error) {
        // Log desabilitado: Error updating incident
        throw error;
      }
      
      // Incident update success logging disabled
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.full_name || 'Funcionário não encontrado',
        type: data.type,
        severity: data.severity,
        description: data.description,
        incidentDate: data.incident_date,
        reporterId: data.reporter_id,
        reporterName: data.reporter?.name || null,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      // Error in updateIncident logging disabled
      throw error;
    }
  },

  async deleteIncident(id: number): Promise<void> {
    try {
      // Log desabilitado: Deleting incident
      
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Log desabilitado: Error deleting incident
        throw error;
      }
      
      // Incident deletion success logging disabled
    } catch (error) {
      // Error in deleteIncident logging disabled
      throw error;
    }
  },

  async getIncidentStats(): Promise<IncidentStats> {
    try {
    
      
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('type, severity, status, created_at, updated_at');
      
      if (error) {
        // Error fetching incident stats logging disabled
        throw error;
      }
      
      const totalIncidents = incidents.length;
      const openIncidents = incidents.filter(i => i.status === 'ativo').length;
      const resolvedIncidents = incidents.filter(i => i.status === 'resolvido' || i.status === 'arquivado').length;
      const criticalIncidents = incidents.filter(i => i.severity === 'grave').length;
      
      // Group by type
      const incidentsByType: { [key: string]: number } = {};
      incidents.forEach(incident => {
        incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1;
      });
      
      // Group by severity
      const incidentsBySeverity: { [key: string]: number } = {};
      incidents.forEach(incident => {
        incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1;
      });
      
      // Calculate average resolution time (in days)
      const resolvedIncidentsWithDates = incidents.filter(i => 
        (i.status === 'resolvido' || i.status === 'arquivado') && 
        i.created_at && 
        i.updated_at
      );
      
      let averageResolutionTime = 0;
      if (resolvedIncidentsWithDates.length > 0) {
        const totalResolutionTime = resolvedIncidentsWithDates.reduce((sum, incident) => {
          const created = new Date(incident.created_at!);
          const resolved = new Date(incident.updated_at!);
          const diffInDays = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          return sum + diffInDays;
        }, 0);
        averageResolutionTime = totalResolutionTime / resolvedIncidentsWithDates.length;
      }
      
      const stats: IncidentStats = {
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        criticalIncidents,
        incidentsByType,
        incidentsBySeverity,
        averageResolutionTime: Math.round(averageResolutionTime * 100) / 100
      };
      
      // console.log('✅ Incident stats calculated:', stats);
      return stats;
    } catch (error) {
      // Error in getIncidentStats logging disabled
      throw error;
    }
  },

  async getIncidentTypes(): Promise<string[]> {
    try {
      // Fetching incident types logging disabled
      
      const { data, error } = await supabase
        .from('incidents')
        .select('type')
        .order('type');
      
      if (error) {
        // Error fetching incident types logging disabled
        throw error;
      }
      
      const uniqueTypes = [...new Set(data.map(item => item.type))];
      // console.log('✅ Incident types fetched:', uniqueTypes);
      
      return uniqueTypes;
    } catch (error) {
      // Error in getIncidentTypes logging disabled
      throw error;
    }
  }
};