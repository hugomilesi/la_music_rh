
export interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  position: string;
}

export interface Document {
  id: string;
  employee_id: string;
  employee: Employee;
  document_name: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  expiry_date: string | null;
  status: string;
  notes: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
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
