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
        .select('id, username')
        .eq('auth_user_id', user.id)
        .single();

      if (userDataError || !userData) {
        throw new Error('Usuário não encontrado na base de dados');
      }

      // Criar metadados no nome do arquivo para identificação
      const fileExtension = uploadData.file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      
      // Formato: benefitId_documentType_documentName_uploadedBy_uploadedByName_timestamp_randomId.extension
      const sanitizedDocumentName = uploadData.document_name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const sanitizedUserName = userData.username.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const fileName = `${uploadData.benefit_id}_${uploadData.document_type || 'documento'}_${sanitizedDocumentName}_${userData.id}_${sanitizedUserName}_${timestamp}_${randomId}.${fileExtension}`;
      const filePath = `benefit-documents/${fileName}`;

      console.log('🔍 Upload Debug:', {
        fileName,
        filePath,
        fileType: uploadData.file.type,
        fileSize: uploadData.file.size,
        benefitId: uploadData.benefit_id,
        documentType: uploadData.document_type,
        uploadedBy: userData.username
      });

      // Upload do arquivo para o Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload Error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload Success:', uploadResult);

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadResult.path);

      // Retornar documento com dados extraídos do nome do arquivo
      const document: BenefitDocument = {
        id: randomId,
        benefit_id: uploadData.benefit_id,
        name: uploadData.document_name,
        file_path: uploadResult.path,
        file_size: uploadData.file.size,
        file_type: uploadData.file.type,
        status: 'approved' as const,
        uploaded_by: userData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        public_url: urlData.publicUrl,
        document_type: uploadData.document_type,
        uploaded_by_name: userData.username
      };

      console.log('✅ Document Created:', document);
      return document;
    } catch (error) {
      console.error('❌ Upload Document Error:', error);
      throw error;
    }
  },

  async getDocumentsByBenefit(benefitId: string): Promise<BenefitDocument[]> {
    try {
      console.log('🔍 Getting documents for benefit:', benefitId);

      // Listar arquivos do bucket que começam com o benefitId
      const { data: files, error: storageError } = await supabase.storage
        .from('documents')
        .list('benefit-documents', {
          limit: 100,
          offset: 0
        });

      if (storageError) {
        console.error('❌ Storage Error:', storageError);
        throw storageError;
      }

      // Filtrar arquivos que pertencem ao benefício específico
      const benefitFiles = files?.filter(file => 
        file.name.startsWith(`${benefitId}_`)
      ) || [];

      console.log('🔍 Found files:', benefitFiles.length);

      // Converter arquivos em objetos BenefitDocument
      const documents: BenefitDocument[] = benefitFiles.map((file) => {
        // Extrair metadados do nome do arquivo
        // Formato: benefitId_documentType_documentName_uploadedBy_uploadedByName_timestamp_randomId.extension
        const nameParts = file.name.split('_');
        const extension = file.name.split('.').pop();
        
        if (nameParts.length >= 7) {
          const [fileBenefitId, documentType, documentName, uploadedBy, uploadedByName, timestamp, randomIdWithExt] = nameParts;
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
            uploaded_by_name: uploadedByName.replace(/_/g, ' '),
            document_type: documentType,
            created_at: this.safeParseDate(timestamp) || new Date().toISOString(),
            updated_at: this.safeParseDate(timestamp) || new Date().toISOString(),
            public_url: urlData.publicUrl
          };
        }
        
        // Fallback para arquivos com formato antigo
        const nameParts_old = file.name.split('_');
        if (nameParts_old.length >= 5) {
          const [fileBenefitId, documentName, uploadedBy, timestamp, randomIdWithExt] = nameParts_old;
          const randomId = randomIdWithExt.split('.')[0];
          
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(`benefit-documents/${file.name}`);

          return {
            id: randomId,
            benefit_id: fileBenefitId,
            name: documentName.replace(/_/g, ' '),
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
        
        // Fallback final para arquivos com formato diferente
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
      });

      console.log('✅ Documents processed:', documents.length);
      return documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    } catch (error) {
      console.error('❌ Get Documents Error:', error);
      throw error;
    }
  },

  async downloadDocument(filePath: string): Promise<Blob> {
    try {
      // Buscar arquivo diretamente no storage usando o file_path
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (downloadError) {
        console.error('❌ Download Error:', downloadError);
        throw new Error('Documento não encontrado no storage');
      }

      return fileData;

    } catch (error) {
      console.error('❌ Download Document Error:', error);
      throw error;
    }
  },

  async getDocumentUrl(filePath: string): Promise<string> {
    try {
      // Obter URL pública do arquivo usando o file_path
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log('✅ Generated URL:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('❌ Get Document URL Error:', error);
      throw error;
    }
  },

  async deleteDocument(documentId: string, filePath?: string): Promise<void> {
    try {
      console.log('🗑️ Deletando documento:', documentId);
      
      let filePathToDelete = filePath;
      
      // Se não foi fornecido o filePath, tentar encontrar o arquivo no storage
      if (!filePathToDelete) {
        console.log('🔍 Buscando arquivo no storage...');
        
        // Listar arquivos do bucket para encontrar o arquivo pelo ID
        const { data: files, error: storageError } = await supabase.storage
          .from('documents')
          .list('benefit-documents', {
            limit: 100,
            offset: 0
          });

        if (storageError) {
          console.error('❌ Erro ao listar arquivos:', storageError);
          throw new Error('Erro ao acessar storage');
        }

        // Procurar arquivo que contenha o documentId no nome
        // O ID pode estar no final do nome do arquivo antes da extensão
        const targetFile = files?.find(file => {
          // Verificar se o arquivo contém o documentId no nome
          const fileName = file.name;
          const nameParts = fileName.split('_');
          
          // Para o formato novo: benefitId_documentType_documentName_uploadedBy_uploadedByName_timestamp_randomId.extension
          if (nameParts.length >= 7) {
            const randomIdWithExt = nameParts[6];
            const randomId = randomIdWithExt.split('.')[0];
            return randomId === documentId;
          }
          
          // Para o formato antigo: benefitId_documentName_uploadedBy_timestamp_randomId.extension
          if (nameParts.length >= 5) {
            const randomIdWithExt = nameParts[4];
            const randomId = randomIdWithExt.split('.')[0];
            return randomId === documentId;
          }
          
          // Fallback: verificar se o ID está em qualquer parte do nome
          return fileName.includes(`_${documentId}.`) || fileName.includes(`_${documentId}_`) || fileName === documentId;
        });

        if (!targetFile) {
          console.error('❌ Arquivo não encontrado no storage para ID:', documentId);
          console.log('🔍 Arquivos disponíveis:', files?.map(f => f.name));
          throw new Error('Documento não encontrado');
        }

        filePathToDelete = `benefit-documents/${targetFile.name}`;
        console.log('📁 Arquivo encontrado:', targetFile.name);
      }

      console.log('📁 Deletando arquivo do storage:', filePathToDelete);
      
      // Deletar arquivo do storage
      const { error: deleteStorageError } = await supabase.storage
        .from('documents')
        .remove([filePathToDelete]);

      if (deleteStorageError) {
        console.error('❌ Erro ao deletar do storage:', deleteStorageError);
        throw new Error('Falha ao deletar documento do storage');
      }

      console.log('✅ Documento deletado com sucesso:', documentId);

    } catch (error) {
      console.error('❌ Erro geral ao deletar documento:', error);
      throw error;
    }
  },

  async updateDocument(documentId: string, updates: Partial<BenefitDocument>): Promise<BenefitDocument> {
    try {
      // Para atualizar metadados, precisamos fazer re-upload do arquivo com novos metadados
      // Por enquanto, vamos apenas retornar o documento atual com as atualizações aplicadas
      const documents = await this.getDocumentsByBenefit('');
      const currentDocument = documents.find(doc => doc.id === documentId);
      
      if (!currentDocument) {
        throw new Error('Documento não encontrado');
      }

      // Retornar documento com atualizações aplicadas
      const updatedDocument: BenefitDocument = {
        ...currentDocument,
        name: updates.name || currentDocument.name,
        status: updates.status || currentDocument.status,
        updated_at: new Date().toISOString()
      };

      return updatedDocument;

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