import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: 'válido' | 'vencido' | 'vencendo' | 'pendente';
  expiry_date?: string;
  notes?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpload {
  employee_id: string;
  document_name: string;
  document_type: string;
  file: File;
  expiry_date?: string;
  notes?: string;
  uploaded_by: string;
}

export const documentService = {
  // Get all documents for an employee
  async getDocumentsByEmployeeId(employeeId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          users(full_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching employee documents:', error);
      throw error;
    }
  },

  // Get all documents
  async getAllDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          users(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all documents:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching all documents:', error);
      throw error;
    }
  },

  // Upload a new document
  async uploadDocument(uploadData: DocumentUpload): Promise<Document> {
    try {
      console.log('🔄 Starting document upload:', uploadData.document_name);
      
      // Generate unique file path
      const timestamp = Date.now();
      // More comprehensive sanitization for file names and paths
      const sanitizedFileName = uploadData.file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      const sanitizedDocumentType = uploadData.document_type
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      const filePath = `employees/${uploadData.employee_id}/${sanitizedDocumentType}/${timestamp}_${sanitizedFileName}`;
      
      // Upload file to storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('✅ File uploaded to storage:', uploadResult.path);
      
      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: uploadData.employee_id,
          document_name: uploadData.document_name,
          document_type: uploadData.document_type,
          file_name: uploadData.file.name,
          file_path: uploadResult.path,
          file_size: uploadData.file.size,
          mime_type: uploadData.file.type,
          status: 'válido',
          expiry_date: uploadData.expiry_date || null,
          notes: uploadData.notes || null,
          uploaded_by: uploadData.uploaded_by
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('❌ Database insert error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([uploadResult.path]);
        throw dbError;
      }
      
      console.log('✅ Document record created:', document.id);
      return document;
    } catch (error) {
      console.error('❌ Document upload failed:', error);
      throw error;
    }
  },

  // Download a document
  async downloadDocument(documentId: string): Promise<string> {
    try {
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path, file_name')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('Error fetching document:', docError);
        throw docError;
      }
      
      // Create signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry
      
      if (urlError) {
        console.error('Error creating download URL:', urlError);
        throw urlError;
      }
      
      return urlData.signedUrl;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },

  // Update document metadata
  async updateDocument(documentId: string, updates: Partial<Pick<Document, 'document_name' | 'status' | 'expiry_date' | 'notes'>>): Promise<Document> {
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }
      
      return document;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document info first
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();
      
      if (docError) {
        console.error('Error fetching document for deletion:', docError);
        throw docError;
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);
      
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage fails
      }
      
      // Delete document record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (deleteError) {
        console.error('Error deleting document record:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ Document deleted successfully:', documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }
}