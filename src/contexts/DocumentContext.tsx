import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { documentService } from '@/services/documentService';
import { documentChecklistService } from '@/services/documentChecklistService';
import { Document, DocumentUpload } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DocumentFilter {
  searchTerm?: string;
  type?: 'all' | 'obrigatorio' | 'temporario' | 'complementar';
  status?: 'all' | 'pendente' | 'completo' | 'vencendo' | 'vencido';
  employee?: string;
}

interface DocumentStats {
  total: number;
  valid: number;
  expiring: number;
  expired: number;
  pending: number;
}

interface DocumentContextType {
  documents: Document[];
  filteredDocuments: Document[];
  filter: DocumentFilter;
  setFilter: (filter: Partial<DocumentFilter>) => void;
  stats: DocumentStats;
  loading: boolean;
  error: string | null;
  uploadDocument: (uploadData: DocumentUpload) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  downloadDocument: (document: Document) => Promise<void>;
  viewDocument: (document: Document) => void;
  exportDocuments: () => void;
  exportDocumentsByEmployee: (employeeId: string) => void;
  loadDocuments: () => Promise<void>;
  requiredDocuments: any[]; // Add required documents to context
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [filter, setFilterState] = useState<DocumentFilter>({
    searchTerm: '',
    type: 'all',
    status: 'all',
    employee: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  // Load required documents using the new view
  const loadRequiredDocuments = async () => {
    try {
      // Use the new view for better synchronization
      const userDocuments = await documentChecklistService.getUserRequiredDocuments();
      
      // Extract unique required documents from the view
      const uniqueRequiredDocs = userDocuments.reduce((acc, item) => {
        const existingDoc = acc.find(doc => doc.id === item.required_document_id);
        if (!existingDoc) {
          acc.push({
            id: item.required_document_id,
            name: item.document_name,
            document_type: item.document_type,
            is_mandatory: item.is_mandatory,
            is_active: item.is_active,
            category: item.category,
            description: item.description
          });
        }
        return acc;
      }, []);

      setRequiredDocuments(uniqueRequiredDocs);
      
      // Trigger synchronization if there are sync issues
      const syncIssues = userDocuments.filter(item => item.sync_status !== 'synchronized');
      if (syncIssues.length > 0) {
        console.log('Problemas de sincronização detectados, executando sincronização automática...');
        await documentChecklistService.syncUserRequiredDocuments();
        // Reload after sync
        const updatedUserDocuments = await documentChecklistService.getUserRequiredDocuments();
        const updatedRequiredDocs = updatedUserDocuments.reduce((acc, item) => {
          const existingDoc = acc.find(doc => doc.id === item.required_document_id);
          if (!existingDoc) {
            acc.push({
              id: item.required_document_id,
              name: item.document_name,
              document_type: item.document_type,
              is_mandatory: item.is_mandatory,
              is_active: item.is_active,
              category: item.category,
              description: item.description
            });
          }
          return acc;
        }, []);
        setRequiredDocuments(updatedRequiredDocs);
      }
    } catch (error) {
      console.error('Erro ao carregar documentos obrigatórios:', error);
    }
  };

  // Load required documents on mount
  useEffect(() => {
    loadRequiredDocuments();
  }, []);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setError('Erro ao carregar documentos');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os documentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update checklist after document upload
  const updateChecklistAfterUpload = async (document: Document) => {
    try {
      console.log('Verificando se documento corresponde a um documento obrigatório:', document);
      
      // Find matching required document
      const matchingRequiredDoc = requiredDocuments.find(reqDoc => {
        const docName = document.file_name || document.document_name || '';
        const docType = document.document_type || '';
        
        // Check if document matches by name or type
        return docName.toLowerCase().includes(reqDoc.name.toLowerCase()) ||
               docName.toLowerCase().includes(reqDoc.document_type.toLowerCase()) ||
               docType.toLowerCase().includes(reqDoc.document_type.toLowerCase());
      });

      if (matchingRequiredDoc && matchingRequiredDoc.is_mandatory) {
        console.log('Documento obrigatório encontrado, atualizando checklist:', matchingRequiredDoc);
        
        // Get employee checklist
        const employeeChecklist = await documentChecklistService.getEmployeeDocumentChecklist(document.employee_id);
        
        // Find the checklist item for this required document
        const checklistItem = employeeChecklist.find(item => 
          item.required_document_id === matchingRequiredDoc.id
        );

        if (checklistItem) {
          // Update checklist item status to 'completo' and link the document
          await documentChecklistService.updateChecklistItemStatus(checklistItem.id, 'completo');
          
          // Update the checklist item with the document ID
          const { error } = await supabase
            .from('employee_document_checklist')
            .update({ 
              document_id: document.id,
              updated_at: new Date().toISOString()
            })
            .eq('id', checklistItem.id);

          if (error) {
            console.error('Erro ao vincular documento ao checklist:', error);
          } else {
            console.log('Checklist atualizado com sucesso para documento:', document.file_name);
            toast({
              title: 'Checklist Atualizado',
              description: `Documento obrigatório "${matchingRequiredDoc.name}" marcado como completo`,
            });
          }
        } else {
          console.log('Item do checklist não encontrado, criando novo item...');
          // If checklist item doesn't exist, sync the employee checklist
          await documentChecklistService.syncEmployeeChecklist(document.employee_id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar checklist após upload:', error);
      // Don't throw error to avoid breaking the upload flow
    }
  };

  const uploadDocument = async (uploadData: DocumentUpload): Promise<Document> => {
    try {
      setLoading(true);
      
      const newDocument = await documentService.uploadDocument({
        ...uploadData,
        document_type: uploadData.documentType,
        employee_id: uploadData.employeeId,
        file_name: uploadData.file.name,
        file_size: uploadData.file.size,
        mime_type: uploadData.file.type
      });

      // Update checklist automatically if document matches required document
      await updateChecklistAfterUpload(newDocument);

      await loadDocuments();
      
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso'
      });

      return newDocument;
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload do documento',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await documentService.deleteDocument(id);
      await loadDocuments();
      
      toast({
        title: 'Sucesso',
        description: 'Documento excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir documento',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (document: Document): Promise<void> => {
    try {
      await documentService.downloadDocument(document.id);
      
      toast({
        title: 'Sucesso',
        description: 'Download iniciado'
      });
    } catch (error) {
      console.error('Erro ao fazer download do documento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer download do documento',
        variant: 'destructive'
      });
    }
  };

  const viewDocument = (document: Document): void => {
    // Open document in new tab
    window.open(document.file_url, '_blank');
  };

  const exportDocuments = (): void => {
    // Implementation for exporting documents
    console.log('Exporting documents...');
  };

  const exportDocumentsByEmployee = (employeeId: string): void => {
    // Implementation for exporting documents by employee
    console.log('Exporting documents for employee:', employeeId);
  };

  const setFilter = (newFilter: Partial<DocumentFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const matchesSearch = 
          (doc.document_name && doc.document_name.toLowerCase().includes(searchLower)) ||
          (doc.document_type && doc.document_type.toLowerCase().includes(searchLower)) ||
          (doc.file_name && doc.file_name.toLowerCase().includes(searchLower)) ||
          (doc.employee && doc.employee.username && doc.employee.username.toLowerCase().includes(searchLower)) ||
          (doc.employee && doc.employee.email && doc.employee.email.toLowerCase().includes(searchLower)) ||
          (doc.employee && doc.employee.position && doc.employee.position.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Type filter - Fixed logic for mandatory documents
      if (filter.type && filter.type !== 'all') {
        if (filter.type === 'obrigatorio') {
          // Check if document matches any mandatory required document
          const mandatoryDocs = requiredDocuments.filter(reqDoc => reqDoc.is_mandatory);
          const isDocumentMandatory = mandatoryDocs.some(reqDoc => {
            // Check if document name or file path contains the required document name
            const docName = doc.file_name || doc.document_name || '';
            return docName.toLowerCase().includes(reqDoc.name.toLowerCase()) ||
                   docName.toLowerCase().includes(reqDoc.document_type.toLowerCase());
          });
          if (!isDocumentMandatory) return false;
        } else {
          // For other types, use the existing logic
          if (doc.document_type !== filter.type) return false;
        }
      }

      // Status filter
      if (filter.status && filter.status !== 'all') {
        if (doc.status !== filter.status) return false;
      }

      // Employee filter
      if (filter.employee) {
        const employeeMatch = 
          (doc.employee && doc.employee.username && doc.employee.username.toLowerCase().includes(filter.employee.toLowerCase())) ||
          (doc.employee && doc.employee.email && doc.employee.email.toLowerCase().includes(filter.employee.toLowerCase())) ||
          (doc.employee && doc.employee.position && doc.employee.position.toLowerCase().includes(filter.employee.toLowerCase()));
        if (!employeeMatch) return false;
      }

      return true;
    });
  }, [documents, filter, requiredDocuments]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredDocuments.length;
    const valid = filteredDocuments.filter(doc => doc.status === 'completo').length;
    const expiring = filteredDocuments.filter(doc => doc.status === 'vencendo').length;
    const expired = filteredDocuments.filter(doc => doc.status === 'vencido').length;
    const pending = filteredDocuments.filter(doc => doc.status === 'pendente').length;

    return {
      total,
      valid,
      expiring,
      expired,
      pending
    };
  }, [filteredDocuments]);

  const value: DocumentContextType = {
    documents,
    filteredDocuments,
    filter,
    setFilter,
    stats,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    viewDocument,
    exportDocuments,
    exportDocumentsByEmployee,
    loadDocuments,
    requiredDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};