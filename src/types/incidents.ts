export interface Incident {
  id: number;
  employeeId: string;
  employeeName?: string;
  type: string;
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
  incidentDate: string;
  reporterId?: string;
  reporterName?: string;
  status: 'ativo' | 'resolvido' | 'arquivado';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncidentData {
  employeeId: string;
  type: string;
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
  incidentDate: string;
  reporterId?: string;
  status?: 'ativo' | 'resolvido' | 'arquivado';
}

export interface UpdateIncidentData {
  type?: string;
  severity?: 'leve' | 'moderado' | 'grave';
  description?: string;
  incidentDate?: string;
  reporterId?: string;
  status?: 'ativo' | 'resolvido' | 'arquivado';
}

export interface IncidentStats {
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  criticalIncidents: number;
  incidentsByType: { [key: string]: number };
  incidentsBySeverity: { [key: string]: number };
  averageResolutionTime: number;
}

export interface IncidentFilter {
  employeeId?: string;
  type?: string;
  severity?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}