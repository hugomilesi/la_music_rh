import { supabase } from '@/integrations/supabase/client';

async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
}

export const documentAuditService = {
  /**
   * Registrar ação
   */
  async logAction(
    action: string,
    documentId: string | null,
    employeeId: string,
    userId: string,
    changes?: any,
    notes?: string
  ) {
    const { error } = await supabase
      .from('document_audit_log')
      .insert({
        document_id: documentId,
        employee_id: employeeId,
        action: action,
        performed_by: userId,
        changes: changes,
        notes: notes,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });

    if (error) console.error('Erro ao registrar log de auditoria:', error);
  },

  /**
   * Buscar logs de um documento
   */
  async getDocumentLogs(documentId: string) {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select(`
        *,
        performed_by_user:users!performed_by (username, email)
      `)
      .eq('document_id', documentId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar logs de um colaborador
   */
  async getEmployeeLogs(employeeId: string) {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select(`
        *,
        performed_by_user:users!performed_by (username, email)
      `)
      .eq('employee_id', employeeId)
      .order('performed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar todos os logs (com paginação)
   */
  async getAllLogs(limit: number = 100, offset: number = 0) {
    const { data, error } = await supabase
      .from('document_audit_log')
      .select(`
        *,
        performed_by_user:users!performed_by (username, email),
        employee:colaboradores (nome)
      `)
      .order('performed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }
};
