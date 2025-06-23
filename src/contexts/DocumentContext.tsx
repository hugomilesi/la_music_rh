
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Document, DocumentFilter, DocumentUpload, DocumentStats, DocumentType, DocumentStatus } from '@/types/document';
import { useEmployees } from './EmployeeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilterState] = useState<DocumentFilter>({
    searchTerm: '',
    type: 'all',
    status: 'all',
    employee: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { employees } = useEmployees();
  const { toast } = useToast();

  // Fetch documents from Supabase
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching documents from Supabase...');
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          employees!documents_employee_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar documentos.',
          variant: 'destructive',
        });
        return;
      }

      // Transform database data to match our interface
      const transformedDocuments: Document[] = data.map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        employee: doc.employees?.name || 'Unknown',
        document: doc.document_name,
        type: getDocumentTypeFromName(doc.document_type),
        uploadDate: doc.created_at.split('T')[0],
        expiryDate: doc.expiry_date,
        status: doc.status as DocumentStatus,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        uploadedBy: doc.uploaded_by,
        notes: doc.notes,
        fileUrl: doc.file_path
      }));

      console.log('Documents fetched successfully:', transformedDocuments.length);
      setDocuments(transformedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Helper function to determine document type from name
  const getDocumentTypeFromName = (documentType: string): DocumentType => {
    const obligatoryDocs = [
      'Contrato de Trabalho',
      'Carteira de Trabalho', 
      'CPF',
      'RG',
      'Comprovante de Residência',
      'Atestado de Saúde Ocupacional',
      'PIS/PASEP',
      'Título de Eleitor'
    ];
    
    const temporaryDocs = [
      'Atestado Médico',
      'Licença Médica',
      'Atestado de Comparecimento'
    ];

    if (obligatoryDocs.includes(documentType)) {
      return 'obrigatorio';
    } else if (temporaryDocs.includes(documentType)) {
      return 'temporario';
    } else {
      return 'complementar';
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
    try {
      setIsLoading(true);
      console.log('Starting document upload...', upload.file.name);
      
      const employee = employees.find(emp => emp.id === upload.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Generate unique file path
      const fileExtension = upload.file.name.split('.').pop();
      const timestamp = Date.now();
      const sanitizedFileName = upload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${employee.name}/${upload.documentType}/${timestamp}_${sanitizedFileName}`;

      console.log('Uploading file to storage...', filePath);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, upload.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Insert document record into database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert([{
          employee_id: upload.employeeId,
          document_name: upload.documentType,
          document_type: upload.documentType,
          file_name: upload.file.name,
          file_path: uploadData.path,
          file_size: upload.file.size,
          mime_type: upload.file.type,
          expiry_date: upload.expiryDate || null,
          notes: upload.notes || null,
          uploaded_by: 'Admin'
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('documents').remove([uploadData.path]);
        throw dbError;
      }

      console.log('Document record created:', documentData);

      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso.',
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar documento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [employees, toast, fetchDocuments]);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    try {
      console.log('Updating document:', id, updates);

      // Convert updates to database format
      const dbUpdates: any = {};
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.expiryDate !== undefined) dbUpdates.expiry_date = updates.expiryDate;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.document) dbUpdates.document_name = updates.document;

      const { error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating document:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao atualizar documento.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Documento atualizado com sucesso.',
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar documento.',
        variant: 'destructive',
      });
    }
  }, [toast, fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      console.log('Deleting document:', id);

      // First get the document to find the file path
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching document for deletion:', fetchError);
        throw fetchError;
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete document record from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) {
        console.error('Error deleting document from database:', dbError);
        throw dbError;
      }

      toast({
        title: 'Sucesso',
        description: 'Documento removido com sucesso.',
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover documento.',
        variant: 'destructive',
      });
    }
  }, [toast, fetchDocuments]);

  const setFilter = useCallback((newFilter: Partial<DocumentFilter>) => {
    setFilterState(prev => ({ ...prev, ...newFilter }));
  }, []);

  const exportDocuments = useCallback((format: 'pdf' | 'excel') => {
    console.log(`Exporting documents in ${format} format...`);
    const data = filteredDocuments.map(doc => ({
      Colaborador: doc.employee,
      Documento: doc.document,
      Tipo: doc.type,
      'Data Upload': doc.uploadDate,
      Validade: doc.expiryDate || 'Sem validade',
      Status: doc.status
    }));
    console.log('Export data:', data);
    toast({
      title: 'Exportação iniciada',
      description: `Exportação em formato ${format.toUpperCase()} iniciada!`,
    });
  }, [filteredDocuments, toast]);

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
    toast({
      title: 'Exportação iniciada',
      description: `Exportação de documentos de ${employee?.name} em formato ${format.toUpperCase()} iniciada!`,
    });
  }, [documents, employees, toast]);

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

  const downloadDocument = useCallback(async (doc: Document) => {
    try {
      console.log('Downloading document:', doc.fileName);
      
      // Get signed URL from Supabase Storage
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.fileUrl || doc.fileName, 3600); // 1 hour expiry

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        toast({
          title: 'Erro',
          description: 'Erro ao gerar link de download.',
          variant: 'destructive',
        });
        return;
      }

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = signedUrlData.signedUrl;
      link.download = doc.fileName || 'document.pdf';
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sucesso',
        description: 'Download iniciado com sucesso.',
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao fazer download do documento.',
        variant: 'destructive',
      });
    }
  }, [toast]);

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
