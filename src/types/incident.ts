/**
 * Representa um incidente registrado no sistema
 */
export interface Incident {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  description: string;
  incidentDate: string;
  reporterId: string;
  reporterName: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dados para criação de um novo incidente
 */
export interface NewIncidentData {
  employeeId: string;
  employeeName?: string;
  type: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  description: string;
  incidentDate: string;
  reporterId: string;
  reporterName?: string;
  status?: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
}

/**
 * Filtros disponíveis para incidentes
 */
export type IncidentFilter = 'all' | 'active' | 'resolved' | 'thisMonth';

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