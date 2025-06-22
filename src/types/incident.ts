
export interface Incident {
  id: string;
  employeeId: string;
  employee: string;
  type: 'Atraso' | 'Falta Injustificada' | 'Comportamento Inadequado' | 'Outros';
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
  date: string;
  reporter: string;
  status: 'ativo' | 'resolvido' | 'arquivado';
  createdAt: string;
  updatedAt: string;
  resolvedBy?: string;
  resolvedDate?: string;
  resolution?: string;
  attachments?: string[];
}

export interface IncidentStats {
  total: number;
  active: number;
  resolved: number;
  thisMonth: number;
}

export interface IncidentFilters {
  searchTerm: string;
  severity: 'all' | 'leve' | 'moderado' | 'grave';
  status: 'all' | 'ativo' | 'resolvido' | 'arquivado';
  type: 'all' | 'Atraso' | 'Falta Injustificada' | 'Comportamento Inadequado' | 'Outros';
  dateRange: {
    from?: Date;
    to?: Date;
  };
}
