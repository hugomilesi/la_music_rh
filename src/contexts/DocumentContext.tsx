import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, DocumentFilter, DocumentUpload, DocumentStats, DocumentType, DocumentStatus } from '@/types/document';
import { useEmployees } from './EmployeeContext';

interface DocumentContextType {
  documents: Document[];
  filteredDocuments: Document[];
  filter: DocumentFilter;
  stats: DocumentStats;
  isLoading: boolean;
  uploadDocument: (upload: DocumentUpload) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setFilter: (filter: Partial<DocumentFilter>) => void;
  exportDocuments: (format: 'pdf' | 'excel') => void;
  exportDocumentsByEmployee: (employeeId: string, format: 'pdf' | 'excel') => void;
  getDocumentsByEmployee: (employeeId: string) => Document[];
  downloadDocument: (document: Document) => void;
  getEmployeeDocumentStats: (employeeId: string) => { total: number; valid: number; expiring: number; expired: number };
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

// Enhanced mock data with real employee names
const mockDocuments: Document[] = [
  {
    id: '1',
    employeeId: '1',
    employee: 'Aline Cristina Pessanha Faria',
    document: 'Contrato de Trabalho',
    type: 'obrigatorio',
    uploadDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'válido',
    fileName: 'contrato_aline.pdf',
    fileSize: 2048576,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  {
    id: '2',
    employeeId: '2',
    employee: 'Felipe Elias Carvalho',
    document: 'Atestado Médico',
    type: 'temporario',
    uploadDate: '2024-03-10',
    expiryDate: '2024-03-20',
    status: 'vencido',
    fileName: 'atestado_felipe.pdf',
    fileSize: 1024000,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  {
    id: '3',
    employeeId: '3',
    employee: 'Luciano Nazario de Oliveira',
    document: 'Carteira de Trabalho',
    type: 'obrigatorio',
    uploadDate: '2024-02-05',
    expiryDate: null,
    status: 'válido',
    fileName: 'carteira_luciano.pdf',
    fileSize: 1536000,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  {
    id: '4',
    employeeId: '4',
    employee: 'Fabio Magarinos da Silva',
    document: 'Certificado de Curso',
    type: 'complementar',
    uploadDate: '2024-03-01',
    expiryDate: '2025-03-01',
    status: 'vencendo',
    fileName: 'certificado_fabio.pdf',
    fileSize: 2560000,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  {
    id: '5',
    employeeId: '5',
    employee: 'Fabiana Candido de Assis Silva',
    document: 'RG',
    type: 'obrigatorio',
    uploadDate: '2024-02-15',
    expiryDate: null,
    status: 'válido',
    fileName: 'rg_fabiana.pdf',
    fileSize: 1024000,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  // Additional documents for better grouping demonstration
  {
    id: '6',
    employeeId: '1',
    employee: 'Aline Cristina Pessanha Faria',
    document: 'CPF',
    type: 'obrigatorio',
    uploadDate: '2024-01-20',
    expiryDate: null,
    status: 'válido',
    fileName: 'cpf_aline.pdf',
    fileSize: 512000,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  },
  {
    id: '7',
    employeeId: '2',
    employee: 'Felipe Elias Carvalho',
    document: 'Contrato de Trabalho',
    type: 'obrigatorio',
    uploadDate: '2024-02-01',
    expiryDate: '2025-02-01',
    status: 'válido',
    fileName: 'contrato_felipe.pdf',
    fileSize: 2048576,
    uploadedBy: 'Admin',
    fileUrl: 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'
  }
];

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [filter, setFilterState] = useState<DocumentFilter>({
    searchTerm: '',
    type: 'all',
    status: 'all',
    employee: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { employees } = useEmployees();

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.employee.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
                         doc.document.toLowerCase().includes(filter.searchTerm.toLowerCase());
    
    const matchesType = filter.type === 'all' || doc.type === filter.type;
    const matchesStatus = filter.status === 'all' || doc.status === filter.status;
    const matchesEmployee = filter.employee === '' || doc.employeeId === filter.employee;
    
    return matchesSearch && matchesType && matchesStatus && matchesEmployee;
  });

  const stats: DocumentStats = {
    total: documents.length,
    valid: documents.filter(doc => doc.status === 'válido').length,
    expiring: documents.filter(doc => doc.status === 'vencendo').length,
    expired: documents.filter(doc => doc.status === 'vencido').length
  };

  const uploadDocument = useCallback(async (upload: DocumentUpload) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const employee = employees.find(emp => emp.id === upload.employeeId);
    const newDocument: Document = {
      id: Date.now().toString(),
      employeeId: upload.employeeId,
      employee: employee?.name || 'Unknown',
      document: upload.documentType,
      type: 'complementar', // Default type
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: upload.expiryDate || null,
      status: 'válido',
      fileName: upload.file.name,
      fileSize: upload.file.size,
      uploadedBy: 'Admin',
      notes: upload.notes,
      fileUrl: URL.createObjectURL(upload.file)
    };
    
    setDocuments(prev => [...prev, newDocument]);
    setIsLoading(false);
  }, [employees]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const setFilter = useCallback((newFilter: Partial<DocumentFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  const exportDocuments = useCallback((format: 'pdf' | 'excel') => {
    console.log(`Exporting documents in ${format} format...`);
    // Simulate export
    const data = filteredDocuments.map(doc => ({
      Colaborador: doc.employee,
      Documento: doc.document,
      Tipo: doc.type,
      'Data Upload': doc.uploadDate,
      Validade: doc.expiryDate || 'Sem validade',
      Status: doc.status
    }));
    console.log('Export data:', data);
  }, [filteredDocuments]);

  const exportDocumentsByEmployee = useCallback((employeeId: string, format: 'pdf' | 'excel') => {
    const employeeDocuments = documents.filter(doc => doc.employeeId === employeeId);
    const employee = employees.find(emp => emp.id === employeeId);
    
    console.log(`Exporting ${employeeDocuments.length} documents for ${employee?.name} in ${format} format...`);
    
    const data = employeeDocuments.map(doc => ({
      Documento: doc.document,
      Tipo: doc.type,
      'Data Upload': doc.uploadDate,
      Validade: doc.expiryDate || 'Sem validade',
      Status: doc.status,
      'Nome do Arquivo': doc.fileName
    }));
    
    console.log('Employee export data:', data);
    alert(`Exportação de documentos de ${employee?.name} em formato ${format.toUpperCase()} iniciada!`);
  }, [documents, employees]);

  const getDocumentsByEmployee = useCallback((employeeId: string) => {
    return documents.filter(doc => doc.employeeId === employeeId);
  }, [documents]);

  const getEmployeeDocumentStats = useCallback((employeeId: string) => {
    const employeeDocuments = documents.filter(doc => doc.employeeId === employeeId);
    return {
      total: employeeDocuments.length,
      valid: employeeDocuments.filter(doc => doc.status === 'válido').length,
      expiring: employeeDocuments.filter(doc => doc.status === 'vencendo').length,
      expired: employeeDocuments.filter(doc => doc.status === 'vencido').length
    };
  }, [documents]);

  const downloadDocument = useCallback((doc: Document) => {
    console.log('Downloading document:', doc.fileName);
    
    if (doc.fileUrl) {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName || 'document.pdf';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback for documents without URL
      alert(`Download de ${doc.fileName} iniciado!`);
    }
  }, []);

  return (
    <DocumentContext.Provider value={{
      documents,
      filteredDocuments,
      filter,
      stats,
      isLoading,
      uploadDocument,
      updateDocument,
      deleteDocument,
      setFilter,
      exportDocuments,
      exportDocumentsByEmployee,
      getDocumentsByEmployee,
      downloadDocument,
      getEmployeeDocumentStats
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
