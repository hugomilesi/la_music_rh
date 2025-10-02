import { supabase } from '@/lib/supabase';

export interface RequiredDocument {
  id: string;
  document_type: string;
  name: string;
  description: string;
  is_mandatory: boolean;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  required: boolean;
}

export const requiredDocumentsService = {
  // Buscar todos os documentos (obrigatórios e opcionais) ativos
  async getRequiredDocuments(): Promise<RequiredDocument[]> {
    try {
      console.log('🔍 [requiredDocumentsService] Buscando TODOS os documentos ativos...');
      
      const { data, error } = await supabase
        .from('required_documents')
        .select('id, document_type, name, description, is_mandatory, category, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ [requiredDocumentsService] Erro na consulta:', error);
        throw error;
      }

      console.log('📋 [requiredDocumentsService] Documentos encontrados:', data?.length || 0);
      console.log('📊 [requiredDocumentsService] Dados:', data);

      const documents: RequiredDocument[] = data?.map(item => ({
        id: item.id,
        document_type: item.document_type,
        name: item.name,
        description: item.description || '',
        is_mandatory: item.is_mandatory,
        category: item.category || '',
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      console.log('✅ [requiredDocumentsService] Documentos processados:', documents.length);
      return documents;
    } catch (error) {
      console.error('❌ [requiredDocumentsService] Erro no serviço de documentos:', error);
      throw error;
    }
  },

  // Atualizar status de obrigatoriedade de um documento
  async updateDocumentMandatory(id: string, is_mandatory: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('required_documents')
        .update({ 
          is_mandatory,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar documento obrigatório:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço de atualização de documento:', error);
      throw error;
    }
  },

  // Criar novo documento obrigatório
  async createRequiredDocument(document: Omit<RequiredDocument, 'id' | 'created_at' | 'updated_at'>): Promise<RequiredDocument> {
    try {
      const { data, error } = await supabase
        .from('required_documents')
        .insert({
          ...document,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar documento obrigatório:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no serviço de criação de documento:', error);
      throw error;
    }
  },

  // Remover documento obrigatório (soft delete)
  async removeRequiredDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('required_documents')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover documento obrigatório:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço de remoção de documento:', error);
      throw error;
    }
  },

  // Atualizar nome do documento
  async updateDocumentName(id: string, name: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('required_documents')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar nome do documento:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro no serviço de atualização de nome:', error);
      throw error;
    }
  },

  // Converter documentos do banco para formato do checklist
  convertToChecklistItems(documents: RequiredDocument[]): ChecklistItem[] {
    return documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      required: doc.is_mandatory
    }));
  },

  // Atualizar múltiplos documentos
  async updateMultipleDocuments(updates: Array<{ id: string; is_mandatory?: boolean; name?: string }>): Promise<void> {
    try {
      const promises = updates.map(update => {
        const updateData: any = { updated_at: new Date().toISOString() };
        
        if (update.is_mandatory !== undefined) {
          updateData.is_mandatory = update.is_mandatory;
        }
        
        if (update.name !== undefined) {
          updateData.name = update.name;
        }

        return supabase
          .from('required_documents')
          .update(updateData)
          .eq('id', update.id);
      });

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) {
          console.error('Erro ao atualizar documento:', result.error);
          throw result.error;
        }
      }
    } catch (error) {
      console.error('Erro no serviço de atualização múltipla:', error);
      throw error;
    }
  }
};