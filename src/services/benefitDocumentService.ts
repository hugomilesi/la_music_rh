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
      console.log('📤 BenefitDocumentService: Iniciando upload de documento:', uploadData.document_name);
      
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
        console.error('❌ BenefitDocumentService: Erro no upload do arquivo:', uploadError);
        throw uploadError;
      }
      
      // Log desabilitado: Storage upload
      
      // Create document record in database
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: null, // This is for benefit documents, not employee documents
          title: uploadData.document_name,
          file_name: uploadData.file.name,
          file_path: uploadResult.path
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('❌ BenefitDocumentService: Erro ao inserir documento no banco:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([uploadResult.path]);
        throw dbError;
      }
      
      console.log('✅ BenefitDocumentService: Documento criado com sucesso:', document.id);
      
      // Create relationship between document and employee benefit
      const { error: relationError } = await supabase
        .from('benefit_documents')
        .insert({
          benefit_id: uploadData.employee_benefit_id,
          document_id: document.id
        });
      
      if (relationError) {
        console.warn('⚠️ BenefitDocumentService: Erro ao criar relação documento-benefício:', relationError);
        // This might fail if the table doesn't exist, but we'll continue
        // Could not create benefit-document relation, table might not exist
      }
      
      return {
        ...document,
        employee_benefit_id: uploadData.employee_benefit_id
      };
    } catch (error) {
      console.error('❌ BenefitDocumentService: Erro no upload do documento:', error);
      throw error;
    }
  },

  async getDocumentsByBenefitId(employeeBenefitId: string): Promise<BenefitDocument[]> {
    try {
      console.log('📋 BenefitDocumentService: Buscando documentos do benefício:', employeeBenefitId);
      
      // Query benefit_documents table with join to documents
      const { data: relations, error: relationError } = await supabase
        .from('benefit_documents')
        .select(`
          document_id,
          documents!inner(
            id,
            title,
            file_name,
            file_path,
            created_at,
            updated_at
          )
        `)
        .eq('benefit_id', employeeBenefitId);
      
      if (relationError && relationError.code !== 'PGRST116') {
        console.error('❌ BenefitDocumentService: Erro ao buscar documentos do benefício:', relationError);
        throw relationError;
      }
      
      if (relations && relations.length > 0) {
        return relations.map(rel => ({
          id: rel.documents.id,
          employee_benefit_id: employeeBenefitId,
          document_name: rel.documents.title || '',
          document_type: 'benefit',
          file_name: rel.documents.file_name || '',
          file_path: rel.documents.file_path || '',
          file_size: 0,
          mime_type: '',
          status: 'válido' as const,
          uploaded_by: '',
          created_at: rel.documents.created_at || '',
          updated_at: rel.documents.updated_at || ''
        }));
      }
      
      // Fallback: return empty array if no relations found
      return [];
    } catch (error) {
      // Log desabilitado: Error fetching benefit documents
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
        // Log desabilitado: Error fetching document
        throw docError;
      }
      
      // Create signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry
      
      if (urlError) {
        console.error('❌ BenefitDocumentService: Erro ao criar URL de download:', urlError);
        throw urlError;
      }
      
      return urlData.signedUrl;
    } catch (error) {
      console.error('❌ BenefitDocumentService: Erro ao baixar documento:', error);
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
        console.error('❌ BenefitDocumentService: Erro ao buscar documento para exclusão:', docError);
        throw docError;
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);
      
      if (storageError) {
        console.warn('⚠️ BenefitDocumentService: Erro ao deletar do storage:', storageError);
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
        console.error('❌ BenefitDocumentService: Erro ao deletar registro do documento:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ BenefitDocumentService: Documento deletado com sucesso:', documentId);
    } catch (error) {
      console.error('❌ BenefitDocumentService: Erro ao deletar documento:', error);
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
        console.error('❌ BenefitDocumentService: Erro ao atualizar documento:', error);
        throw error;
      }
      
      console.log('✅ BenefitDocumentService: Documento atualizado com sucesso:', documentId);
      return document;
    } catch (error) {
      console.error('❌ BenefitDocumentService: Erro ao atualizar documento:', error);
      throw error;
    }
  }
};