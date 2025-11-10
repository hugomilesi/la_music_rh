import { supabase } from '@/integrations/supabase/client';

export const documentHistoryService = {
  /**
   * Substituir documento (mantém histórico)
   */
  async substituirDocumento(
    documentId: string,
    novoArquivo: File,
    novaValidade: Date,
    motivo?: string,
    userId?: string
  ) {
    // 1. Buscar documento atual
    const { data: docAtual, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Copiar para histórico
    const { error: historyError } = await supabase
      .from('document_history')
      .insert({
        document_id: docAtual.id,
        employee_id: docAtual.employee_id,
        file_path: docAtual.file_path,
        file_name: docAtual.file_name,
        file_size: docAtual.file_size,
        mime_type: docAtual.mime_type,
        expires_at: docAtual.expires_at,
        status: docAtual.status,
        replaced_by: userId,
        replacement_reason: motivo
      });

    if (historyError) throw historyError;

    // 3. Upload novo arquivo
    const timestamp = Date.now();
    const filePath = `documents/${docAtual.category || 'geral'}/${timestamp}_${novoArquivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, novoArquivo);

    if (uploadError) throw uploadError;

    // 4. Atualizar documento
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        file_path: filePath,
        file_name: novoArquivo.name,
        file_size: novoArquivo.size,
        mime_type: novoArquivo.type,
        expires_at: novaValidade.toISOString(),
        status: 'enviado',
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { success: true };
  },

  /**
   * Soft delete (move para lixeira)
   */
  async softDeleteDocument(
    documentId: string,
    userId: string,
    reason?: string
  ) {
    // 1. Buscar documento
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Copiar para lixeira
    const { error: trashError } = await supabase
      .from('deleted_documents')
      .insert({
        document_id: doc.id,
        document_data: doc,
        deleted_by: userId,
        deletion_reason: reason
      });

    if (trashError) throw trashError;

    // 3. Remover da tabela principal
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) throw deleteError;

    return { success: true };
  },

  /**
   * Restaurar documento da lixeira
   */
  async restoreDocument(deletedDocId: string, userId: string) {
    // 1. Buscar na lixeira
    const { data, error: fetchError } = await supabase
      .from('deleted_documents')
      .select('*')
      .eq('id', deletedDocId)
      .single();

    if (fetchError) throw fetchError;

    if (!data.can_restore) {
      throw new Error('Documento não pode ser restaurado');
    }

    // 2. Restaurar na tabela principal
    const { error: restoreError } = await supabase
      .from('documents')
      .insert(data.document_data);

    if (restoreError) throw restoreError;

    // 3. Atualizar lixeira
    const { error: updateError } = await supabase
      .from('deleted_documents')
      .update({
        can_restore: false,
        restored_at: new Date().toISOString(),
        restored_by: userId
      })
      .eq('id', deletedDocId);

    if (updateError) throw updateError;

    return { success: true };
  },

  /**
   * Buscar histórico de um documento
   */
  async getDocumentHistory(documentId: string) {
    const { data, error } = await supabase
      .from('document_history')
      .select(`
        *,
        replaced_by_user:users!replaced_by (username, email)
      `)
      .eq('document_id', documentId)
      .order('replaced_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar documentos na lixeira
   */
  async getDeletedDocuments() {
    const { data, error } = await supabase
      .from('deleted_documents')
      .select(`
        *,
        deleted_by_user:users!deleted_by (username, email)
      `)
      .eq('can_restore', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
