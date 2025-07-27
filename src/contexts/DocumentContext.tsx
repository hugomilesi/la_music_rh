import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { documentService, Document as ServiceDocument } from '@/services/documentService';
import { Document, DocumentUpload } from '@/types/document';
import { useToast } from '@/hooks/use-toast';

interface DocumentFilter {
  searchTerm?: string;
  type?: 'all' | 'obrigatorio' | 'temporario' | 'complementar';
  status?: 'all' | 'válido' | 'vencido' | 'vencendo' | 'pendente';
  employeeId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface DocumentStats {
  total: number;
  valid: number;
  expired: number;
  expiring: number;
  pending: number;
}

interface DocumentContextType {
  documents: Document[];
  filteredDocuments: Document[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  filter: DocumentFilter;
  stats: DocumentStats;
  loadDocuments: () => Promise<void>;
  uploadDocument: (uploadData: DocumentUpload) => Promise<Document>;
  updateDocument: (documentId: string, updates: Partial<Document>) => Promise<Document>;
  replaceDocument: (documentId: string, newFile: File) => Promise<Document>;
  deleteDocument: (documentId: string) => Promise<void>;
  downloadDocument: (document: Document) => Promise<void>;
  viewDocument: (document: Document) => Promise<void>;
  exportDocumentsByEmployee: (employeeId: string, format: 'pdf' | 'excel') => Promise<void>;
  getDocumentsByEmployee: (employeeId: string) => Promise<Document[]>;
  setFilter: (newFilter: Partial<DocumentFilter>) => void;
  exportDocuments: (format: 'pdf' | 'excel') => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};

// Export comprehensive useDocuments hook
export const useDocuments = () => {
  return useDocumentContext();
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilterState] = useState<DocumentFilter>({
    searchTerm: '',
    type: 'all',
    status: 'all'
  });
  const { toast } = useToast();

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Helper function to map service document to UI document
  const mapServiceDocumentToUIDocument = (serviceDoc: ServiceDocument & { employee?: { full_name: string } }): Document => {
    // Ensure we have a valid UUID for the document ID
    const documentId = typeof serviceDoc.id === 'string' ? serviceDoc.id : String(serviceDoc.id);
    
    return {
      id: documentId,
      employeeId: serviceDoc.employee_id,
      employee: serviceDoc.employee?.full_name || 'Nome não encontrado',
      document: serviceDoc.document_name,
      type: serviceDoc.document_type as Document['type'],
      uploadDate: serviceDoc.created_at,
      expiryDate: serviceDoc.expiry_date,
      status: serviceDoc.status,
      fileUrl: serviceDoc.file_path,
      fileName: serviceDoc.file_name,
      fileSize: serviceDoc.file_size,
      uploadedBy: serviceDoc.uploaded_by,
      notes: serviceDoc.notes
    };
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading documents...');
      const data = await documentService.getAllDocuments();
      console.log('✅ Documents loaded:', data.length);
      const mappedDocuments = data.map(mapServiceDocumentToUIDocument);
      setDocuments(mappedDocuments);
    } catch (err) {
      console.error('❌ Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar documentos');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (uploadData: DocumentUpload): Promise<Document> => {
    try {
      console.log('🔄 Uploading document:', uploadData.documentType);
      
      // Map UI upload data to service upload data
      const serviceUploadData = {
        employee_id: uploadData.employeeId,
        document_name: uploadData.file.name,
        document_type: uploadData.documentType,
        file: uploadData.file,
        expiry_date: uploadData.expiryDate,
        notes: uploadData.notes,
        uploaded_by: 'current_user' // TODO: Get from auth context
      };
      
      const newServiceDocument = await documentService.uploadDocument(serviceUploadData);
      console.log('✅ Document uploaded:', newServiceDocument.id);
      
      // Map service document to UI document
      const newDocument = mapServiceDocumentToUIDocument(newServiceDocument);
      
      // Add to local state
      setDocuments(prev => [newDocument, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso'
      });
      
      return newDocument;
    } catch (err) {
      console.error('❌ Error uploading document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar documento';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateDocument = async (documentId: string, updates: Partial<Document>): Promise<Document> => {
    try {
      // Map UI updates to service updates
      const serviceUpdates: any = {};
      if (updates.document) serviceUpdates.document_name = updates.document;
      if (updates.status) serviceUpdates.status = updates.status;
      if (updates.expiryDate !== undefined) serviceUpdates.expiry_date = updates.expiryDate;
      if (updates.notes !== undefined) serviceUpdates.notes = updates.notes;
      
      const updatedServiceDocument = await documentService.updateDocument(documentId, serviceUpdates);
      const updatedDocument = mapServiceDocumentToUIDocument(updatedServiceDocument);
      
      // Update local state
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? updatedDocument : doc)
      );
      
      toast({
        title: 'Sucesso',
        description: 'Documento atualizado com sucesso'
      });
      
      return updatedDocument;
    } catch (err) {
      console.error('❌ Error updating document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar documento',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteDocument = async (documentId: string): Promise<void> => {
    try {
      await documentService.deleteDocument(documentId);
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso'
      });
    } catch (err) {
      console.error('❌ Error deleting document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir documento',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const replaceDocument = async (documentId: string, newFile: File): Promise<Document> => {
    try {
      console.log('🔄 Replacing document:', documentId);
      
      // Find the existing document
      const existingDocument = documents.find(doc => doc.id === documentId);
      if (!existingDocument) {
        throw new Error('Document not found');
      }
      
      // Delete the old document
      await documentService.deleteDocument(documentId);
      
      // Upload the new document with the same metadata
      const uploadData = {
        employee_id: existingDocument.employeeId,
        document_name: existingDocument.document,
        document_type: existingDocument.type,
        file: newFile,
        expiry_date: existingDocument.expiryDate,
        notes: existingDocument.notes,
        uploaded_by: 'current_user' // TODO: Get from auth context
      };
      
      const newServiceDocument = await documentService.uploadDocument(uploadData);
      const newDocument = mapServiceDocumentToUIDocument(newServiceDocument);
      
      // Update local state - replace the old document with the new one
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? newDocument : doc)
      );
      
      toast({
        title: 'Sucesso',
        description: 'Documento substituído com sucesso'
      });
      
      return newDocument;
    } catch (err) {
      console.error('❌ Error replacing document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao substituir documento',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const downloadDocument = async (document: Document): Promise<void> => {
    try {
      console.log('🔄 Downloading document:', document.id);
      
      // Ensure we have a valid document ID
      if (!document.id || typeof document.id !== 'string') {
        throw new Error('Invalid document ID');
      }
      
      const downloadUrl = await documentService.downloadDocument(document.id);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.fileName || document.document;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Sucesso',
        description: 'Download iniciado com sucesso'
      });
    } catch (err) {
      console.error('❌ Error downloading document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao baixar documento',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const viewDocument = async (document: Document): Promise<void> => {
    try {
      console.log('🔄 Viewing document:', document.id);
      
      // Ensure we have a valid document ID
      if (!document.id || typeof document.id !== 'string') {
        throw new Error('Invalid document ID');
      }
      
      const viewUrl = await documentService.downloadDocument(document.id);
      
      // Open document in new tab
      window.open(viewUrl, '_blank');
      
      toast({
        title: 'Sucesso',
        description: 'Documento aberto em nova aba'
      });
    } catch (err) {
      console.error('❌ Error viewing document:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao visualizar documento',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const exportDocumentsByEmployee = async (employeeId: string, format: 'pdf' | 'excel'): Promise<void> => {
    try {
      console.log('🔄 Exporting documents for employee:', employeeId, 'format:', format);
      
      // Get employee documents
      const employeeDocuments = documents.filter(doc => doc.employeeId === employeeId);
      
      if (employeeDocuments.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum documento encontrado para este funcionário'
        });
        return;
      }
      
      if (format === 'excel') {
        // Create CSV content
        const headers = ['Documento', 'Tipo', 'Data Upload', 'Data Validade', 'Status', 'Arquivo', 'Tamanho', 'Observações'];
        const csvContent = [
          headers.join(','),
          ...employeeDocuments.map(doc => [
            `"${doc.document}"`,
            `"${doc.type}"`,
            `"${new Date(doc.uploadDate).toLocaleDateString('pt-BR')}"`,
            `"${doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('pt-BR') : 'Sem validade'}"`,
            `"${doc.status}"`,
            `"${doc.fileName}"`,
            `"${doc.fileSize ? (doc.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}"`,
            `"${doc.notes || ''}"`
          ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `documentos_funcionario_${employeeId}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Sucesso',
          description: 'Documentos exportados com sucesso'
        });
      } else {
        // TODO: Implement PDF export functionality
        toast({
          title: 'Em desenvolvimento',
          description: `Exportação de documentos em ${format.toUpperCase()} será implementada em breve`
        });
      }
    } catch (err) {
      console.error('❌ Error exporting employee documents:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar documentos do funcionário',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const getDocumentsByEmployee = async (employeeId: string): Promise<Document[]> => {
    try {
      const serviceDocuments = await documentService.getDocumentsByEmployeeId(employeeId);
      return serviceDocuments.map(mapServiceDocumentToUIDocument);
    } catch (err) {
      console.error('❌ Error getting employee documents:', err);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos do funcionário',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const setFilter = (newFilter: Partial<DocumentFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const exportDocuments = (format: 'pdf' | 'excel') => {
    // TODO: Implement export functionality
    toast({
      title: 'Em desenvolvimento',
      description: `Exportação em ${format.toUpperCase()} será implementada em breve`
    });
  };

  // Filter documents based on current filter
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch = 
          doc.document.toLowerCase().includes(searchLower) ||
          doc.type.toLowerCase().includes(searchLower) ||
          (doc.fileName && doc.fileName.toLowerCase().includes(searchLower)) ||
          doc.employee.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filter.type && filter.type !== 'all') {
        if (doc.type !== filter.type) return false;
      }

      // Status filter
      if (filter.status && filter.status !== 'all') {
        if (doc.status !== filter.status) return false;
      }

      // Employee filter
      if (filter.employee) {
        if (!doc.employee.toLowerCase().includes(filter.employee.toLowerCase())) return false;
      }

      return true;
    });
  }, [documents, filter]);

  // Calculate stats
  const stats = useMemo((): DocumentStats => {
    return {
      total: filteredDocuments.length,
      valid: filteredDocuments.filter(doc => doc.status === 'válido').length,
      expired: filteredDocuments.filter(doc => doc.status === 'vencido').length,
      expiring: filteredDocuments.filter(doc => doc.status === 'vencendo').length,
      pending: filteredDocuments.filter(doc => doc.status === 'pendente').length
    };
  }, [filteredDocuments]);

  const value: DocumentContextType = {
    documents,
    filteredDocuments,
    loading,
    isLoading: loading,
    error,
    filter,
    stats,
    loadDocuments,
    uploadDocument,
    updateDocument,
    replaceDocument,
    deleteDocument,
    downloadDocument,
    viewDocument,
    exportDocumentsByEmployee,
    getDocumentsByEmployee,
    setFilter,
    exportDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};