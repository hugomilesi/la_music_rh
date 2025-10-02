import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { documentService } from '@/services/documentService';
import { Document, DocumentUpload, RequiredDocument, EmployeeDocumentSummary } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DocumentFilter {
  searchTerm?: string;
  type?: 'all' | 'obrigatorio' | 'temporario' | 'complementar';
  status?: 'all' | 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  employee?: string;
}

interface DocumentStats {
  total: number;
  approved: number;
  pending: number;
  submitted: number;
  rejected: number;
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
  requiredDocuments: RequiredDocument[];
  getEmployeeDocumentSummary: (employeeId: string) => Promise<EmployeeDocumentSummary[]>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('DocumentContext: Inicializando DocumentProvider');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([]);
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
  
  console.log('DocumentContext: Profile atual:', profile?.id);

  // Load required documents
  const loadRequiredDocuments = async () => {
    try {
      console.log('DocumentContext: Carregando documentos obrigatórios...');
      const reqDocs = await documentService.getRequiredDocuments();
      console.log('DocumentContext: Documentos obrigatórios carregados:', reqDocs?.length || 0);
      setRequiredDocuments(reqDocs);
    } catch (error) {
      console.error('Erro ao carregar documentos obrigatórios:', error);
    }
  };

  // Load required documents on mount
  useEffect(() => {
    loadRequiredDocuments();
  }, []);

  // Load documents on mount and setup real-time subscription
  useEffect(() => {
    loadDocuments();

    // Gerar IDs únicos para os canais
    const documentsChannelId = `documents-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userRequiredDocsChannelId = `user-required-documents-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('DocumentContext: Criando canais únicos:', { documentsChannelId, userRequiredDocsChannelId });

    // Setup real-time subscription for documents table
    const documentsSubscription = supabase
      .channel(documentsChannelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'documents'
      }, (payload) => {
        console.log('DocumentContext: Mudança detectada na tabela documents:', payload);
        // Reload documents when any change occurs
        loadDocuments();
      })
      .subscribe();

    // Setup real-time subscription for user_required_documents view
    const userRequiredDocsSubscription = supabase
      .channel(userRequiredDocsChannelId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_required_documents'
      }, (payload) => {
        console.log('DocumentContext: Mudança detectada na view user_required_documents:', payload);
        // Reload documents when any change occurs in the view
        loadDocuments();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('DocumentContext: Limpando subscriptions:', { documentsChannelId, userRequiredDocsChannelId });
      try {
        supabase.removeChannel(documentsSubscription);
        supabase.removeChannel(userRequiredDocsSubscription);
      } catch (error) {
        console.warn('DocumentContext: Erro ao limpar subscriptions:', error);
      }
    };
  }, []);

  const loadDocuments = async () => {
    try {
      console.log('DocumentContext: Iniciando loadDocuments...');
      setLoading(true);
      setError(null);
      
      const docs = await documentService.getAllDocuments();
      console.log('DocumentContext: Documentos carregados:', docs?.length || 0);
      setDocuments(docs);
      
      toast({
        title: 'Sucesso',
        description: `${docs?.length || 0} documentos carregados`,
        variant: 'default'
      });
    } catch (error) {
      console.error('DocumentContext: Erro ao carregar documentos:', error);
      setError('Erro ao carregar documentos');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (uploadData: DocumentUpload): Promise<Document> => {
    try {
      console.log('DocumentContext: Fazendo upload do documento:', uploadData);
      setLoading(true);
      
      // Buscar o required_document_id baseado no documentType
      let required_document_id: string | undefined = undefined;
      
      if (uploadData.documentType && requiredDocuments.length > 0) {
        // Mapear os tipos de documento do frontend para os tipos do banco
        const documentTypeMapping: Record<string, string> = {
          'Contrato de Trabalho': 'contrato_trabalho',
          'Comprovante de Residência': 'comprovante_residencia',
          'RG': 'rg',
          'CPF': 'CPF', // Manter como está no banco
          'Carteira de Trabalho': 'carteira_trabalho',
          'Título de Eleitor': 'titulo_eleitor',
          'Certificado de Reservista': 'certificado_reservista',
          'Certidão de Nascimento': 'certidao_nascimento',
          'Atestado de Saúde Ocupacional': 'atestado_saude',
          'Comprovante de Escolaridade': 'comprovante_escolaridade',
          'Foto 3x4': 'foto_3x4',
          'Exame Médico Admissional': 'medico',
          'PIS/PASEP': 'pis_pasep'
        };
        
        const mappedType = documentTypeMapping[uploadData.documentType];
        
        // Primeiro tenta encontrar com o tipo mapeado
        let requiredDoc = requiredDocuments.find(doc => 
          doc.document_type === mappedType && doc.is_active
        );
        
        // Se não encontrar, tenta buscar pelo nome exato
        if (!requiredDoc) {
          requiredDoc = requiredDocuments.find(doc => 
            doc.document_type === uploadData.documentType && doc.is_active
          );
        }
        
        // Se ainda não encontrar, tenta buscar pelo nome do documento
        if (!requiredDoc) {
          requiredDoc = requiredDocuments.find(doc => 
            doc.name === uploadData.documentType && doc.is_active
          );
        }
        
        if (requiredDoc) {
          required_document_id = requiredDoc.id;
          console.log('DocumentContext: Documento obrigatório encontrado:', {
            documentType: uploadData.documentType,
            mappedType,
            foundType: requiredDoc.document_type,
            requiredDocId: required_document_id
          });
        } else {
          console.log('DocumentContext: Documento obrigatório não encontrado para:', {
            documentType: uploadData.documentType,
            mappedType,
            availableTypes: requiredDocuments.map(d => ({ type: d.document_type, name: d.name }))
          });
        }
      }
      
      // Converter os dados do frontend para o formato esperado pelo backend
      const serviceUploadData = {
        name: uploadData.documentType || uploadData.file.name,
        description: uploadData.notes,
        category: uploadData.documentType,
        file: uploadData.file,
        status: 'enviado' as const, // Mudando de 'pendente' para 'enviado' quando o documento é enviado
        is_public: false,
        tags: uploadData.documentType ? [uploadData.documentType] : [],
        expires_at: uploadData.expiryDate,
        created_by: profile?.id,
        employee_id: uploadData.employeeId,
        required_document_id: required_document_id
      };
      
      console.log('DocumentContext: Dados convertidos para o serviço:', serviceUploadData);
      console.log('DocumentContext: User ID:', profile?.id);
      console.log('DocumentContext: Employee ID:', uploadData.employeeId);
      
      const newDocument = await documentService.uploadDocument(serviceUploadData);
      console.log('DocumentContext: Documento enviado com sucesso:', newDocument);
      
      // Reload documents to get updated list
      await loadDocuments();
      
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso',
        variant: 'default'
      });
      
      return newDocument;
    } catch (error) {
      console.error('DocumentContext: Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar documento',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      console.log('DocumentContext: Deletando documento:', id);
      setLoading(true);
      
      await documentService.deleteDocument(id);
      console.log('DocumentContext: Documento deletado com sucesso');
      
      // Reload documents to get updated list
      await loadDocuments();
      
      toast({
        title: 'Sucesso',
        description: 'Documento deletado com sucesso',
        variant: 'default'
      });
    } catch (error) {
      console.error('DocumentContext: Erro ao deletar documento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar documento',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (document: Document): Promise<void> => {
    try {
      console.log('DocumentContext: Fazendo download do documento:', document.id);
      await documentService.downloadDocument(document.id, document.name);
      
      toast({
        title: 'Sucesso',
        description: 'Download iniciado',
        variant: 'default'
      });
    } catch (error) {
      console.error('DocumentContext: Erro ao fazer download:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer download do documento',
        variant: 'destructive'
      });
    }
  };

  const viewDocument = (document: Document): void => {
    try {
      console.log('DocumentContext: Visualizando documento:', document.id);
      documentService.viewDocument(document.id);
    } catch (error) {
      console.error('DocumentContext: Erro ao visualizar documento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao visualizar documento',
        variant: 'destructive'
      });
    }
  };

  const exportDocuments = (): void => {
    try {
      console.log('DocumentContext: Exportando documentos');
      documentService.exportDocuments(filteredDocuments);
      
      toast({
        title: 'Sucesso',
        description: 'Exportação iniciada',
        variant: 'default'
      });
    } catch (error) {
      console.error('DocumentContext: Erro ao exportar documentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar documentos',
        variant: 'destructive'
      });
    }
  };

  const exportDocumentsByEmployee = (employeeId: string): void => {
    try {
      console.log('DocumentContext: Exportando documentos do funcionário:', employeeId);
      const employeeDocuments = documents.filter(doc => doc.employee_id === employeeId);
      documentService.exportDocuments(employeeDocuments);
      
      toast({
        title: 'Sucesso',
        description: 'Exportação iniciada',
        variant: 'default'
      });
    } catch (error) {
      console.error('DocumentContext: Erro ao exportar documentos do funcionário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar documentos',
        variant: 'destructive'
      });
    }
  };

  const getEmployeeDocumentSummary = async (employeeId: string): Promise<EmployeeDocumentSummary[]> => {
    try {
      console.log('DocumentContext: Obtendo resumo de documentos do funcionário:', employeeId);
      return await documentService.getEmployeeDocumentSummary(employeeId);
    } catch (error) {
      console.error('DocumentContext: Erro ao obter resumo de documentos:', error);
      throw error;
    }
  };

  const setFilter = (newFilter: Partial<DocumentFilter>) => {
    console.log('DocumentContext: Atualizando filtro:', newFilter);
    setFilterState(prev => ({ ...prev, ...newFilter }));
  };

  // Filtered documents based on current filter
  const filteredDocuments = useMemo(() => {
    console.log('DocumentContext: Aplicando filtros aos documentos');
    let filtered = [...documents];

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.employee_name?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(doc => doc.type === filter.type);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filter.status);
    }

    if (filter.employee) {
      filtered = filtered.filter(doc => doc.employee_id === filter.employee);
    }

    console.log('DocumentContext: Documentos filtrados:', filtered.length);
    return filtered;
  }, [documents, filter]);

  // Calculate stats based on filtered documents
  const stats = useMemo((): DocumentStats => {
    const total = filteredDocuments.length;
    const approved = filteredDocuments.filter(doc => doc.status === 'aprovado').length;
    const pending = filteredDocuments.filter(doc => doc.status === 'pendente').length;
    const submitted = filteredDocuments.filter(doc => doc.status === 'enviado').length;
    const rejected = filteredDocuments.filter(doc => doc.status === 'rejeitado').length;

    const statsResult = {
      total,
      approved,
      pending,
      submitted,
      rejected
    };

    console.log('DocumentContext: Estatísticas calculadas:', statsResult);
    return statsResult;
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
    requiredDocuments,
    getEmployeeDocumentSummary
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export { DocumentContext };