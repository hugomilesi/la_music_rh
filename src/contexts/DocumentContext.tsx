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
  replaceDocument: (id: string, file: File) => Promise<void>;
  viewDocument: (doc: Document) => Promise<void>;
  setFilter: (filter: Partial<DocumentFilter>) => void;
  exportDocuments: (format: 'pdf' | 'excel') => void;
  exportDocumentsByEmployee: (employeeId: string, format: 'pdf' | 'excel') => void;
  getDocumentsByEmployee: (employeeId: string) => Document[];
  downloadDocument: (document: Document) => void;
  getEmployeeDocumentStats: (employeeId: string) => { total: number; valid: number; expiring: number; expired: number };
  // Checklist functions
  getDocumentChecklist: () => Promise<any[]>;
  updateDocumentChecklist: (checklistItems: any[]) => Promise<void>;
  getEmployeeChecklist: (employeeId: string) => Promise<any[]>;
  updateEmployeeChecklistItem: (employeeId: string, checklistId: string, status: string, notes?: string) => Promise<void>;
  // Accounting functions
  sendToAccountant: (employeeIds: string[], documentIds: string[], email: string, subject: string, message: string) => Promise<void>;
  getAccountingSubmissions: () => Promise<any[]>;
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
      const transformedDocuments: Document[] = (data || []).map((doc: any) => ({
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

  const replaceDocument = useCallback(async (id: string, file: File) => {
    try {
      // Find the existing document
      const existingDoc = documents.find(doc => doc.id === id);
      if (!existingDoc) {
        throw new Error('Documento não encontrado');
      }

      // Delete old file from storage
      if (existingDoc.fileUrl || existingDoc.fileName) {
        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove([existingDoc.fileUrl || existingDoc.fileName]);
        
        if (deleteError) {
          console.warn('Warning: Could not delete old file:', deleteError);
        }
      }

      // Upload new file
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading replacement file:', uploadError);
        throw uploadError;
      }

      // Update document record
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          file_name: file.name,
          file_path: uploadData.path,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating document record:', updateError);
        throw updateError;
      }

      toast({
        title: 'Sucesso',
        description: 'Documento substituído com sucesso.',
      });

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error replacing document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao substituir documento.',
        variant: 'destructive',
      });
    }
  }, [documents, toast, fetchDocuments]);

  const viewDocument = useCallback(async (doc: Document) => {
    try {
      console.log('Viewing document:', doc.fileName);
      
      // Get signed URL from Supabase Storage
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.fileUrl || doc.fileName, 3600); // 1 hour expiry

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        toast({
          title: 'Erro',
          description: 'Erro ao gerar link de visualização.',
          variant: 'destructive',
        });
        return;
      }

      // Open in new tab for viewing
      window.open(signedUrlData.signedUrl, '_blank');

      toast({
        title: 'Sucesso',
        description: 'Documento aberto para visualização.',
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao visualizar documento.',
        variant: 'destructive',
      });
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
      if (document?.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
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

  const exportDocumentsByEmployee = useCallback(async (employeeId: string, format: 'pdf' | 'excel') => {
    try {
      const employeeDocuments = documents.filter(doc => doc.employeeId === employeeId);
      const employee = employees.find(emp => emp.id === employeeId);
      
      if (employeeDocuments.length === 0) {
        toast({
          title: 'Aviso',
          description: 'Nenhum documento encontrado para este funcionário.',
          variant: 'destructive',
        });
        return;
      }

      console.log(`Downloading ${employeeDocuments.length} documents for ${employee?.name}...`);
      
      // Create a zip file name
      const zipFileName = `Documentos_${employee?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.zip`;
      
      // For now, we'll download each file individually
      // In a real implementation, you'd want to create a zip file
      let downloadCount = 0;
      
      for (const doc of employeeDocuments) {
        try {
          // Get signed URL from Supabase Storage
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('documents')
            .createSignedUrl(doc.fileUrl || doc.fileName, 3600);

          if (urlError) {
            console.error('Error creating signed URL for', doc.fileName, urlError);
            continue;
          }

          // Create a temporary link element and trigger download
          const link = document.createElement('a');
          link.href = signedUrlData.signedUrl;
          link.download = `${employee?.name?.replace(/\s+/g, '_')}_${doc.fileName}`;
          link.target = '_blank';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          downloadCount++;
          
          // Add a small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error downloading document:', doc.fileName, error);
        }
      }
      
      toast({
        title: 'Sucesso',
        description: `${downloadCount} documento(s) de ${employee?.name} baixado(s) com sucesso.`,
      });
    } catch (error) {
      console.error('Error exporting employee documents:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar documentos do funcionário.',
        variant: 'destructive',
      });
    }
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

  // Checklist functions
  const getDocumentChecklist = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('document_checklists')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching document checklist:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching document checklist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar checklist de documentos.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  const updateDocumentChecklist = useCallback(async (checklistItems: any[]) => {
    try {
      // Update existing items
      for (const item of checklistItems) {
        if (item.id) {
          const { error } = await supabase
            .from('document_checklists')
            .update({
              document_name: item.document_name,
              document_type: item.document_type,
              is_required: item.is_required,
              description: item.description,
              category: item.category,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (error) throw error;
        } else {
          // Insert new items
          const { error } = await supabase
            .from('document_checklists')
            .insert([{
              document_name: item.document_name,
              document_type: item.document_type,
              is_required: item.is_required,
              description: item.description,
              category: item.category
            }]);

          if (error) throw error;
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Checklist de documentos atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating document checklist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar checklist de documentos.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getEmployeeChecklist = useCallback(async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employee_document_checklists')
        .select(`
          *,
          document_checklists!fk_document_checklist(*),
          documents(*)
        `)
        .eq('employee_id', employeeId);

      if (error) {
        console.error('Error fetching employee checklist:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching employee checklist:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar checklist do funcionário.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  const updateEmployeeChecklistItem = useCallback(async (employeeId: string, checklistId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('employee_document_checklists')
        .upsert({
          employee_id: employeeId,
          document_checklist_id: checklistId,
          status,
          observacoes: notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id,document_checklist_id'
        });

      if (error) {
        console.error('Error updating employee checklist item:', error);
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Item do checklist atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating employee checklist item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item do checklist.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Accounting functions
  const sendToAccountant = useCallback(async (employeeIds: string[], documentIds: string[], email: string, subject: string, message: string) => {
    try {
      setIsLoading(true);
      
      // Get current user from auth context
      const { data: { user } } = await supabase.auth.getUser();
      
      // Record the submission in database
      const { data, error } = await supabase
        .from('accounting_submissions')
        .insert([{
          employee_ids: employeeIds,
          document_ids: documentIds,
          recipient_email: email,
          subject,
          message,
          sent_by: user?.id,
          status: 'enviado'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error recording accounting submission:', error);
        throw error;
      }

      // Here you would integrate with an email service
      // For now, we'll just simulate the email sending
      console.log('Sending email to accountant:', {
        to: email,
        subject,
        message,
        employeeIds,
        documentIds
      });

      toast({
        title: 'Sucesso',
        description: 'Documentos enviados para contabilidade com sucesso.',
      });
    } catch (error) {
      console.error('Error sending to accountant:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar documentos para contabilidade.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getAccountingSubmissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('accounting_submissions')
        .select(`
          *,
          profiles!accounting_submissions_sent_by_fkey(name)
        `)
        .order('sent_at', { ascending: false });

      if (error) {
        console.error('Error fetching accounting submissions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching accounting submissions:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico de envios.',
        variant: 'destructive',
      });
      return [];
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
      replaceDocument,
      viewDocument,
      setFilter,
      exportDocuments,
      exportDocumentsByEmployee,
      getDocumentsByEmployee,
      downloadDocument,
      getEmployeeDocumentStats,
      // Checklist functions
      getDocumentChecklist,
      updateDocumentChecklist,
      getEmployeeChecklist,
      updateEmployeeChecklistItem,
      // Accounting functions
      sendToAccountant,
      getAccountingSubmissions
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
