import { supabase } from '@/integrations/supabase/client';
import { BenefitDocumentUpload, BenefitDocument } from '../types/benefits';

export const benefitDocumentService = {
  async uploadDocument(uploadData: BenefitDocumentUpload): Promise<BenefitDocument> {
    try {
      
      // Obter usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar o ID do usuário na tabela users
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userDataError || !userData) {
        throw new Error('Usuário não encontrado na base de dados');
      }

      // Criar metadados no nome do arquivo para identificação
      const fileExtension = uploadData.file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      
      // Formato: benefitId_documentName_uploadedBy_timestamp_randomId.extension
      const fileName = `${uploadData.benefit_id}_${uploadData.document_name.replace(/[^a-zA-Z0-9]/g, '_')}_${userData.id}_${timestamp}_${randomId}.${fileExtension}`;
      const filePath = `benefit-documents/${fileName}`;
      const storageMeta = {
        fileName,
        filePath,
        fileType: uploadData.file.type,
        fileSize: uploadData.file.size
      };

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

      // Salvar metadados na tabela benefit_documents
      const insertPayload = {
        benefit_id: uploadData.benefit_id,
        name: uploadData.document_name,
        file_path: uploadResult.path,
        file_type: uploadData.file.type,
        file_size: uploadData.file.size,
        status: 'pending',
        uploaded_by: userData.id, // Usar o ID da tabela users
        colaborador_id: uploadData.colaborador_id || null
      };

      const { data: documentRecord, error: dbError } = await supabase
        .from('benefit_documents')
        .insert(insertPayload)
        .select()
        .single();

      if (dbError) {
        
        // Limpar arquivo do storage se falhou ao salvar na DB
        await supabase.storage
          .from('documents')
          .remove([uploadResult.path]);
        
        throw dbError;
      }

      // Retornar documento com dados da base de dados
      const document: BenefitDocument = {
        id: documentRecord.id,
        benefit_id: documentRecord.benefit_id,
        name: documentRecord.name,
        file_path: documentRecord.file_path,
        file_size: documentRecord.file_size,
        file_type: documentRecord.file_type,
        status: documentRecord.status as 'pending' | 'approved' | 'rejected',
        uploaded_by: documentRecord.uploaded_by,
        created_at: documentRecord.created_at,
        updated_at: documentRecord.updated_at
      };

      return document;
    } catch (error) {
      throw error;
    }
  },

  async getDocumentsByBenefit(benefitId: string): Promise<BenefitDocument[]> {
    try {
      
      // Buscar documentos na tabela benefit_documents
      const { data: documents, error } = await supabase
        .from('benefit_documents')
        .select('*')
        .eq('benefit_id', benefitId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Converter para o tipo BenefitDocument
      const benefitDocuments: BenefitDocument[] = documents?.map(doc => ({
        id: doc.id,
        benefit_id: doc.benefit_id,
        name: doc.name,
        file_path: doc.file_path,
        file_size: doc.file_size,
        file_type: doc.file_type,
        status: doc.status as 'pending' | 'approved' | 'rejected',
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) || [];

      // Listar arquivos do bucket que começam com o benefitId
      const { data: files, error: storageError } = await supabase.storage
        .from('documents')
        .list('benefit-documents', {
          limit: 100,
          offset: 0
        });

      if (storageError) {
        throw storageError;
      }

      // Filtrar arquivos que pertencem ao benefício específico
      const benefitFiles = files?.filter(file => 
        file.name.startsWith(`${benefitId}_`)
      ) || [];

      // Converter arquivos em objetos BenefitDocument
      const storageDocuments: BenefitDocument[] = await Promise.all(
        benefitFiles.map(async (file) => {
          // Extrair metadados do nome do arquivo
          // Formato: benefitId_documentName_uploadedBy_timestamp_randomId.extension
          const nameParts = file.name.split('_');
          const extension = file.name.split('.').pop();
          
          if (nameParts.length >= 5) {
            const [fileBenefitId, documentName, uploadedBy, timestamp, randomIdWithExt] = nameParts;
            const randomId = randomIdWithExt.split('.')[0];
            
            // Obter URL pública do arquivo
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(`benefit-documents/${file.name}`);

            return {
              id: randomId,
              benefit_id: fileBenefitId,
              name: documentName.replace(/_/g, ' '), // Reverter underscores para espaços
              file_path: `benefit-documents/${file.name}`,
              file_size: file.metadata?.size || 0,
              file_type: this.getFileTypeFromExtension(extension || ''),
              status: 'approved' as const,
              uploaded_by: uploadedBy,
              created_at: this.safeParseDate(timestamp) || new Date().toISOString(),
              updated_at: this.safeParseDate(timestamp) || new Date().toISOString(),
              public_url: urlData.publicUrl
            };
          }
          
          // Fallback para arquivos com formato diferente
          return {
            id: file.name,
            benefit_id: benefitId,
            name: file.name,
            file_path: `benefit-documents/${file.name}`,
            file_size: file.metadata?.size || 0,
            file_type: this.getFileTypeFromExtension(file.name.split('.').pop() || ''),
            status: 'approved' as const,
            uploaded_by: 'unknown',
            created_at: file.created_at || new Date().toISOString(),
            updated_at: file.updated_at || new Date().toISOString()
          };
        })
      );

      // Combinar documentos da tabela e do storage
      const allDocuments = [...benefitDocuments, ...storageDocuments];
      
      
      return allDocuments;

    } catch (error) {
      throw error;
    }
  },

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      // Buscar documento na tabela benefit_documents
      const { data: document, error: dbError } = await supabase
        .from('benefit_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (dbError || !document) {
        throw new Error('Documento não encontrado na base de dados');
      }

      // Download do arquivo usando o file_path
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (downloadError) {
        throw downloadError;
      }

      return fileData;

    } catch (error) {
      throw error;
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      // Buscar documento na tabela benefit_documents
      const { data: document, error: dbError } = await supabase
        .from('benefit_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (dbError || !document) {
        throw new Error('Documento não encontrado na base de dados');
      }

      // Deletar arquivo do storage
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (deleteError) {
        // Continuar mesmo se falhar no storage, pois o importante é remover da DB
      }

      // Deletar registro da tabela benefit_documents
      const { error: dbDeleteError } = await supabase
        .from('benefit_documents')
        .delete()
        .eq('id', documentId);

      if (dbDeleteError) {
        throw dbDeleteError;
      }

    } catch (error) {
      throw error;
    }
  },

  async updateDocument(documentId: string, updates: Partial<BenefitDocument>): Promise<BenefitDocument> {
    try {
      // Atualizar documento na tabela benefit_documents
      const { data: updatedDocument, error: updateError } = await supabase
        .from('benefit_documents')
        .update({
          name: updates.name,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();

      if (updateError || !updatedDocument) {
        throw updateError || new Error('Falha ao atualizar documento');
      }

      // Retornar documento atualizado
      const document: BenefitDocument = {
        id: updatedDocument.id,
        benefit_id: updatedDocument.benefit_id,
        name: updatedDocument.name,
        file_path: updatedDocument.file_path,
        file_size: updatedDocument.file_size,
        file_type: updatedDocument.file_type,
        status: updatedDocument.status as 'pending' | 'approved' | 'rejected',
        uploaded_by: updatedDocument.uploaded_by,
        created_at: updatedDocument.created_at,
        updated_at: updatedDocument.updated_at
      };

      return document;

    } catch (error) {
      throw error;
    }
  },

  // Função auxiliar para parsing seguro de datas
  safeParseDate(timestamp: string): string | null {
    try {
      const parsedTimestamp = parseInt(timestamp);
      if (isNaN(parsedTimestamp) || parsedTimestamp <= 0) {
        return null;
      }
      const date = new Date(parsedTimestamp);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    } catch (error) {
      return null;
    }
  },

  getFileTypeFromExtension(extension: string): string {
    const ext = extension.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
};