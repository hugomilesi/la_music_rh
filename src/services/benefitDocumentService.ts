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
      // Gerar nome único para o arquivo
      const fileExtension = uploadData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = `benefit-documents/${fileName}`;

      // Upload do arquivo para o Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Criar registro no banco de dados
      const documentData = {
        employee_benefit_id: uploadData.employee_benefit_id,
        document_name: uploadData.document_name,
        document_type: uploadData.document_type,
        file_path: uploadResult.path,
        file_size: uploadData.file.size,
        mime_type: uploadData.file.type,
        uploaded_by: uploadData.uploaded_by,
        status: 'pending' as const
      };

      const { data: document, error: dbError } = await supabase
        .from('benefit_documents')
        .insert([documentData])
        .select()
        .single();

      if (dbError) {
        // Tentar limpar o arquivo do storage se falhou no banco
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      // Criar relação documento-benefício
      const { error: relationError } = await supabase
        .from('benefit_document_relations')
        .insert([{
          benefit_document_id: document.id,
          employee_benefit_id: uploadData.employee_benefit_id
        }]);

      if (relationError) {
        // Não falha o processo, apenas registra o warning
      }

      return document;

    } catch (error) {
      throw error;
    }
  },

  async getDocumentsByBenefit(employeeBenefitId: string): Promise<BenefitDocument[]> {
    try {
      // Buscar relações documento-benefício
      const { data: relations, error: relationError } = await supabase
        .from('benefit_document_relations')
        .select(`
          benefit_document_id,
          benefit_documents (
            id,
            document_name,
            document_type,
            file_path,
            file_size,
            mime_type,
            status,
            uploaded_by,
            created_at,
            updated_at
          )
        `)
        .eq('employee_benefit_id', employeeBenefitId);

      if (relationError) {
        throw relationError;
      }

      // Extrair documentos das relações
      const documents = relations?.map(relation => relation.benefit_documents).filter(Boolean) || [];
      
      return documents as BenefitDocument[];

    } catch (error) {
      throw error;
    }
  },

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      // Get document info
      const { data: document, error: docError } = await supabase
        .from('benefit_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (docError) {
        throw docError;
      }

      // Create download URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600); // 1 hour expiry

      if (urlError) {
        throw urlError;
      }

      // Download file
      const response = await fetch(urlData.signedUrl);
      return await response.blob();

    } catch (error) {
      throw error;
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Get document info first
      const { data: document, error: docError } = await supabase
        .from('benefit_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (docError) {
        throw docError;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        // Continue with database deletion even if storage fails
      }

      // Delete relations first
      await supabase
        .from('benefit_document_relations')
        .delete()
        .eq('benefit_document_id', documentId);

      // Delete document record
      const { error: deleteError } = await supabase
        .from('benefit_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (error) {
      throw error;
    }
  },

  async updateDocument(documentId: string, updates: Partial<BenefitDocument>): Promise<BenefitDocument> {
    try {
      const { data, error } = await supabase
        .from('benefit_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
};