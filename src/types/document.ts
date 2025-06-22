
export interface Document {
  id: string;
  employeeId: string;
  employee: string;
  document: string;
  type: DocumentType;
  uploadDate: string;
  expiryDate: string | null;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  notes?: string;
}

export type DocumentType = 'obrigatorio' | 'temporario' | 'complementar';
export type DocumentStatus = 'válido' | 'vencido' | 'vencendo' | 'pendente';

export interface DocumentFilter {
  searchTerm: string;
  type: DocumentType | 'all';
  status: DocumentStatus | 'all';
  employee: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DocumentUpload {
  file: File;
  employeeId: string;
  documentType: string;
  expiryDate?: string;
  notes?: string;
}

export interface DocumentStats {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
}
