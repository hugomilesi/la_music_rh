import { supabase } from '@/integrations/supabase/client';

export interface BenefitDocument {
  id: string;
  employee_benefit_id: string;
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

export interface BenefitDocumentUpload {
  employee_benefit_id: string;
  document_name: string;
  document_type: string;
  file: File;
  expiry_date?: string;
  notes?: string;
  uploaded_by: string;
}

export const benefitDocumentService = {
  async uploadDocument(uploadData: BenefitDocumentUpload): Promise<BenefitDocument> {
    try {
      console.log('🔄 Starting benefit document upload:', uploadData.document_name);
      
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = uploadData.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `benefits/${uploadData.employee_benefit_id}/${timestamp}_${sanitizedFileName}`;
      
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
          employee_id: null, // This is for benefit documents, not employee documents
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
      
      // Create relationship between document and employee benefit
      const { error: relationError } = await supabase
        .from('benefit_documents')
        .insert({
          employee_benefit_id: uploadData.employee_benefit_id,
          document_id: document.id
        });
      
      if (relationError) {
        console.error('❌ Relation creation error:', relationError);
        // This might fail if the table doesn't exist, but we'll continue
        console.warn('⚠️ Could not create benefit-document relation, table might not exist');
      }
      
      return {
        ...document,
        employee_benefit_id: uploadData.employee_benefit_id
      };
    } catch (error) {
      console.error('❌ Document upload failed:', error);
      throw error;
    }
  },

  async getDocumentsByBenefitId(employeeBenefitId: string): Promise<BenefitDocument[]> {
    try {
      // Try to get documents through relation table first
      const { data: relations, error: relationError } = await supabase
        .from('benefit_documents')
        .select(`
          document_id,
          documents!inner(*)
        `)
        .eq('employee_benefit_id', employeeBenefitId);
      
      if (relationError && relationError.code !== 'PGRST116') {
        console.error('Error fetching benefit documents:', relationError);
        throw relationError;
      }
      
      if (relations && relations.length > 0) {
        return relations.map(rel => ({
          ...rel.documents,
          employee_benefit_id: employeeBenefitId
        }));
      }
      
      // Fallback: return empty array if no relations found
      return [];
    } catch (error) {
      console.error('Error fetching benefit documents:', error);
      throw error;
    }
  },

  async downloadDocument(documentId: string): Promise<string> {
    try {
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_path')
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
      
      // Delete relation if exists
      await supabase
        .from('benefit_documents')
        .delete()
        .eq('document_id', documentId);
      
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

  async updateDocument(documentId: string, updates: Partial<Pick<BenefitDocument, 'document_name' | 'status' | 'expiry_date' | 'notes'>>): Promise<BenefitDocument> {
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
  }
};