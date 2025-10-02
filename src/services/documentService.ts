import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  name: string;
  description?: string;
  category?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  status?: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  is_public?: boolean;
  tags?: string[];
  created_by?: string;
  employee_id?: string;
  required_document_id?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  employee?: {
    id: string;
    username: string;
    email: string;
  };
  required_document?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface DocumentUpload {
  name: string;
  description?: string;
  category?: string;
  file: File;
  status?: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
  is_public?: boolean;
  tags?: string[];
  expires_at?: string;
  created_by?: string;
  employee_id?: string;
  required_document_id?: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description?: string;
  document_type: string;
  is_mandatory: boolean;
  is_active: boolean;
  category?: string;
  created_at?: string;
}

export interface EmployeeDocumentSummary {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  required_documents: Array<{
    id: string;
    name: string;
    description?: string;
    is_mandatory: boolean;
    status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
    document?: Document;
  }>;
  uploaded_documents: Document[];
}

export const documentService = {
  // Get all documents for an employee
  async getDocumentsByEmployeeId(employeeId: string): Promise<Document[]> {
    try {
      console.log('DocumentService: Buscando documentos do funcionário:', employeeId);
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          employee:colaboradores!documents_employee_id_fkey(
            id,
            nome,
            email
          ),
          required_document:required_documents(
            id,
            name,
            description
          )
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('DocumentService: Erro ao buscar documentos:', error);
        throw error;
      }
      
      console.log('DocumentService: Documentos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('DocumentService: Erro em getDocumentsByEmployeeId:', error);
      throw error;
    }
  },

  // Get all documents
  async getAllDocuments(): Promise<Document[]> {
    try {
      console.log('DocumentService: Buscando todos os documentos...');
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          employee:colaboradores!documents_employee_id_fkey(
            id,
            nome,
            email
          ),
          required_document:required_documents(
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DocumentService: Erro ao buscar todos os documentos:', error);
        throw error;
      }

      console.log('DocumentService: Documentos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('DocumentService: Erro em getAllDocuments:', error);
      throw error;
    }
  },

  // Get employee document summary (for checklist view)
  async getEmployeeDocumentSummary(): Promise<EmployeeDocumentSummary[]> {
    try {
      console.log('DocumentService: Buscando resumo de documentos dos funcionários...');
      
      // Get all employees (colaboradores)
      const { data: employees, error: employeesError } = await supabase
        .from('colaboradores')
        .select('id, nome, email')
        .eq('status', 'ativo')
        .order('nome');

      if (employeesError) {
        console.error('DocumentService: Erro ao buscar funcionários:', employeesError);
        throw employeesError;
      }

      // Get all required documents
      const { data: requiredDocs, error: requiredDocsError } = await supabase
        .from('required_documents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (requiredDocsError) {
        console.error('DocumentService: Erro ao buscar documentos obrigatórios:', requiredDocsError);
        throw requiredDocsError;
      }

      // Get all documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select(`
          *,
          required_document:required_documents(
            id,
            name,
            description
          )
        `);

      if (documentsError) {
        console.error('DocumentService: Erro ao buscar documentos:', documentsError);
        throw documentsError;
      }

      // Build summary for each employee
      const summary: EmployeeDocumentSummary[] = employees?.map(employee => {
        const employeeDocuments = documents?.filter(doc => doc.employee_id === employee.id) || [];
        
        const requiredDocuments = requiredDocs?.map(reqDoc => {
          const document = employeeDocuments.find(doc => doc.required_document_id === reqDoc.id);
          return {
            id: reqDoc.id,
            name: reqDoc.name,
            description: reqDoc.description,
            is_mandatory: reqDoc.is_mandatory,
            status: document ? document.status || 'enviado' : 'pendente' as const,
            document: document || undefined
          };
        }) || [];

        const uploadedDocuments = employeeDocuments.filter(doc => !doc.required_document_id);

        return {
          employee_id: employee.id,
          employee_name: employee.nome,
          employee_email: employee.email,
          required_documents: requiredDocuments,
          uploaded_documents: uploadedDocuments
        };
      }) || [];

      console.log('DocumentService: Resumo gerado para', summary.length, 'funcionários');
      return summary;
    } catch (error) {
      console.error('DocumentService: Erro em getEmployeeDocumentSummary:', error);
      throw error;
    }
  },

  // Get required documents
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    try {
      console.log('DocumentService: Buscando documentos obrigatórios...');
      
      const { data, error } = await supabase
        .from('required_documents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('DocumentService: Erro ao buscar documentos obrigatórios:', error);
        throw error;
      }

      console.log('DocumentService: Documentos obrigatórios encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('DocumentService: Erro em getRequiredDocuments:', error);
      throw error;
    }
  },

  // Upload a new document
  async uploadDocument(uploadData: DocumentUpload): Promise<Document> {
    try {
      console.log('DocumentService: Iniciando upload do documento:', uploadData.name);
      
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = uploadData.file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const sanitizedCategory = (uploadData.category || 'general')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const filePath = `documents/${sanitizedCategory}/${timestamp}_${sanitizedFileName}`;
      
      // Upload file to storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('DocumentService: Erro no upload do arquivo:', uploadError);
        throw uploadError;
      }
      
      console.log('DocumentService: Arquivo enviado com sucesso para:', uploadResult.path);
      
      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: uploadData.name || uploadData.file.name,
          description: uploadData.description,
          category: uploadData.category,
          file_path: uploadResult.path,
          file_size: uploadData.file.size,
          mime_type: uploadData.file.type,
          status: uploadData.status || 'pendente',
          is_public: uploadData.is_public || false,
          tags: uploadData.tags || [],
          employee_id: uploadData.employee_id,
          required_document_id: uploadData.required_document_id,
          created_by: uploadData.created_by,
          uploaded_by: uploadData.created_by, // Adicionando o campo uploaded_by que estava faltando
          expires_at: uploadData.expires_at
        })
        .select(`
          *,
          employee:colaboradores!documents_employee_id_fkey(
            id,
            nome,
            email
          ),
          required_document:required_documents(
            id,
            name,
            description
          )
        `)
        .single();
      
      if (dbError) {
        console.error('DocumentService: Erro ao inserir no banco:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([uploadResult.path]);
        throw dbError;
      }
      
      console.log('DocumentService: Documento criado com sucesso:', document.id);
      return document;
    } catch (error) {
      console.error('DocumentService: Erro em uploadDocument:', error);
      throw error;
    }
  },

  // Download a document
  async downloadDocument(documentId: string, fileName?: string): Promise<void> {
    try {
      console.log('DocumentService: Iniciando download do documento:', documentId);
      
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path, name')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('DocumentService: Erro ao buscar documento:', docError);
        throw docError;
      }
      
      // Create signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
      
      if (urlError) {
        console.error('DocumentService: Erro ao criar URL de download:', urlError);
        throw urlError;
      }
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = urlData.signedUrl;
      link.download = fileName || document.name || 'documento';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('DocumentService: Download iniciado com sucesso');
    } catch (error) {
      console.error('DocumentService: Erro em downloadDocument:', error);
      throw error;
    }
  },

  // View a document (open in new tab)
  async viewDocument(documentId: string): Promise<void> {
    try {
      console.log('DocumentService: Visualizando documento:', documentId);
      
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path, name')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('DocumentService: Erro ao buscar documento:', docError);
        throw docError;
      }
      
      // Create signed URL for viewing
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600);
      
      if (urlError) {
        console.error('DocumentService: Erro ao criar URL de visualização:', urlError);
        throw urlError;
      }
      
      // Open document in new tab
      window.open(urlData.signedUrl, '_blank');
      
      console.log('DocumentService: Documento aberto para visualização');
    } catch (error) {
      console.error('DocumentService: Erro em viewDocument:', error);
      throw error;
    }
  },

  // Update document
  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    try {
      console.log('DocumentService: Atualizando documento:', documentId);
      
      const { data: document, error } = await supabase
        .from('documents')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          status: updates.status,
          is_public: updates.is_public,
          tags: updates.tags,
          expires_at: updates.expires_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select(`
          *,
          employee:colaboradores!documents_employee_id_fkey(
            id,
            nome,
            email
          ),
          required_document:required_documents(
            id,
            name,
            description
          )
        `)
        .single();
      
      if (error) {
        console.error('DocumentService: Erro ao atualizar documento:', error);
        throw error;
      }
      
      console.log('DocumentService: Documento atualizado com sucesso');
      return document;
    } catch (error) {
      console.error('DocumentService: Erro em updateDocument:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      console.log('DocumentService: Deletando documento:', documentId);
      
      // Get document info first
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path, required_document_id')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('DocumentService: Erro ao buscar documento para deletar:', docError);
        throw docError;
      }
      
      // Delete from storage
      if (document.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);
        
        if (storageError) {
          console.error('DocumentService: Erro ao deletar do storage:', storageError);
          // Continue with database deletion even if storage fails
        }
      }
      
      // Delete document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (deleteError) {
        console.error('DocumentService: Erro ao deletar registro do documento:', deleteError);
        throw deleteError;
      }
      
      console.log('DocumentService: Documento deletado com sucesso');
      
      // Note: With the new simplified system, when a required document is deleted,
      // it automatically shows as "pendente" in the checklist view because
      // there's no document record linking to that required_document_id
    } catch (error) {
      console.error('DocumentService: Erro em deleteDocument:', error);
      throw error;
    }
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('DocumentService: Testando conexão...');
      
      const { data, error } = await supabase
        .from('documents')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('DocumentService: Falha no teste de conexão:', error);
        return false;
      }
      
      console.log('DocumentService: Teste de conexão bem-sucedido');
      return true;
    } catch (error) {
      console.error('DocumentService: Erro no teste de conexão:', error);
      return false;
    }
  }
}