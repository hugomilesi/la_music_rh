import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  title: string;
  description?: string;
  document_type?: string;
  category?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  version?: string;
  status?: string;
  is_public?: boolean;
  requires_acknowledgment?: boolean;
  tags?: string[];
  metadata?: any;
  created_by?: string;
  updated_by?: string;
  approved_by?: string;
  approved_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  employee_id?: string;
  employee?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface DocumentUpload {
  title: string;
  description?: string;
  document_type?: string;
  category?: string;
  file: File;
  version?: string;
  status?: string;
  is_public?: boolean;
  requires_acknowledgment?: boolean;
  tags?: string[];
  metadata?: any;
  expires_at?: string;
  created_by?: string;
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
          employee:users(
            id,
            username,
            email
          )
        `)
        .eq('uploaded_by', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('DocumentService: Erro ao buscar documentos:', error);
        throw error;
      }
      
      console.log('DocumentService: Documentos encontrados:', data?.length || 0);
      
      // Map database columns to frontend interface
      return data?.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        category: doc.category,
        file_path: doc.file_path,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        version: doc.version,
        status: doc.status,
        is_public: doc.is_public,
        requires_acknowledgment: doc.requires_acknowledgment,
        tags: doc.tags,
        metadata: doc.metadata,
        created_by: doc.created_by,
        updated_by: doc.updated_by,
        approved_by: doc.approved_by,
        approved_at: doc.approved_at,
        expires_at: doc.expires_at,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        employee_id: doc.uploaded_by, // Map uploaded_by to employee_id for frontend compatibility
        employee: doc.employee
      })) || [];
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
          employee:users(
            id,
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('DocumentService: Erro ao buscar todos os documentos:', error);
        throw error;
      }

      console.log('DocumentService: Documentos encontrados:', data?.length || 0);
      
      // Map database columns to frontend interface
      return data?.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type,
        category: doc.category,
        file_path: doc.file_path,
        file_name: doc.file_name,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        version: doc.version,
        status: doc.status,
        is_public: doc.is_public,
        requires_acknowledgment: doc.requires_acknowledgment,
        tags: doc.tags,
        metadata: doc.metadata,
        expires_at: doc.expires_at,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        created_by: doc.created_by,
        updated_by: doc.updated_by,
        approved_by: doc.approved_by,
        approved_at: doc.approved_at,
        employee_id: doc.uploaded_by, // Map uploaded_by to employee_id for frontend compatibility
        employee: doc.employee
      })) || [];
    } catch (error) {
      console.error('DocumentService: Erro em getAllDocuments:', error);
      throw error;
    }
  },

  // Upload a new document
  async uploadDocument(uploadData: DocumentUpload): Promise<Document> {
    try {
      console.log('DocumentService: Iniciando upload do documento:', uploadData.title);
      
      // Generate unique file path
      const timestamp = Date.now();
      // More comprehensive sanitization for file names and paths
      const sanitizedFileName = uploadData.file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      const sanitizedDocumentType = (uploadData.document_type || 'general')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const filePath = `documents/${sanitizedDocumentType}/${timestamp}_${sanitizedFileName}`;
      
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
          name: uploadData.title || uploadData.file.name,
          description: uploadData.description,
          category: uploadData.category,
          file_path: uploadResult.path,
          file_size: uploadData.file.size,
          mime_type: uploadData.file.type,
          is_public: uploadData.is_public || false,
          tags: uploadData.tags || [],
          uploaded_by: uploadData.created_by,
          expires_at: uploadData.expires_at
        })
        .select()
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
  async downloadDocument(documentId: string): Promise<string> {
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
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry
      
      if (urlError) {
        console.error('DocumentService: Erro ao criar URL de download:', urlError);
        throw urlError;
      }
      
      console.log('DocumentService: URL de download criada com sucesso');
      return urlData.signedUrl;
    } catch (error) {
      console.error('DocumentService: Erro em downloadDocument:', error);
      throw error;
    }
  },

  // Update document metadata
  async updateDocument(documentId: string, updates: Partial<Pick<Document, 'name' | 'description' | 'category' | 'is_public' | 'tags'>>): Promise<Document> {
    try {
      console.log('DocumentService: Atualizando documento:', documentId);
      
      // Map frontend fields to database columns
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.is_public !== undefined) dbUpdates.is_public = updates.is_public;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      
      const { data: document, error } = await supabase
        .from('documents')
        .update(dbUpdates)
        .eq('id', documentId)
        .select()
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
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('DocumentService: Erro ao buscar documento para deletar:', docError);
        throw docError;
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);
      
      if (storageError) {
        console.error('DocumentService: Erro ao deletar do storage:', storageError);
        // Continue with database deletion even if storage fails
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