/**
 * Representa um incidente registrado no sistema
 */
export interface Incident {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  incidentDate: string;
  reporterId: string;
  reporterName: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dados para criação de um novo incidente
 */
export interface NewIncidentData {
  title: string;
  employeeId: string;
  employeeName?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  incidentDate: string;
  reporterId: string;
  reporterName?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}

/**
 * Filtros disponíveis para incidentes
 */
export type IncidentFilter = 'all' | 'open' | 'resolved' | 'thisMonth';

/**
 * Tipos de incidentes pré-definidos
 */
export const INCIDENT_TYPES = [
  'Atraso',
  'Falta Injustificada',
  'Comportamento Inadequado',
  'Desempenho Insatisfatório',
  'Violação de Política',
  'Conflito Interpessoal',
  'Outro'
];

/**
 * Estatísticas de incidentes
 */
export interface IncidentStats {
  total: number;
  active?: number;
  resolved?: number;
  archived?: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  thisMonth: number;
  lastMonth: number;
}