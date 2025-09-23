import { supabase } from '@/integrations/supabase/client';

export interface DocumentChecklistItem {
  id: string;
  employee_id: string;
  required_document_id: string;
  document_id: string | null;
  status: 'pendente' | 'completo' | 'vencendo' | 'vencido';
  employee_name: string;
  required_document_name: string;
  document_type: string;
  is_mandatory: boolean;
  uploaded_document_name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDocumentSummary {
  employee_id: string;
  employee_name: string;
  total_documents: number;
  sent_documents: number;
  validated_documents: number;
  pending_documents: number;
  rejected_documents: number;
  expiring_documents: number;
  expired_documents: number;
  checklist_items: DocumentChecklistItem[];
}

export const documentChecklistService = {
  // Buscar checklist de documentos por colaborador
  async getEmployeeDocumentChecklist(employeeId: string): Promise<DocumentChecklistItem[]> {
    try {
      console.log('DocumentChecklistService: Buscando checklist do colaborador:', employeeId);
      
      const { data, error } = await supabase
        .from('employee_document_checklist')
        .select(`
          id,
          employee_id,
          required_document_id,
          document_id,
          status,
          users!employee_id(username),
          required_documents!required_document_id(name, document_type, is_mandatory),
          documents!document_id(name)
        `)
        .eq('employee_id', employeeId);

      if (error) {
        console.error('DocumentChecklistService: Erro ao buscar checklist:', error);
        throw error;
      }

      const formattedData = data?.map(item => ({
        id: item.id,
        employee_id: item.employee_id,
        required_document_id: item.required_document_id,
        document_id: item.document_id,
        status: item.status,
        employee_name: item.users?.username || 'N/A',
        required_document_name: item.required_documents?.name || 'N/A',
        document_type: item.required_documents?.document_type || 'N/A',
        is_mandatory: item.required_documents?.is_mandatory || false,
        uploaded_document_name: item.documents?.name || null,
      })) || [];

      console.log('DocumentChecklistService: Checklist encontrado:', formattedData.length, 'itens');
      return formattedData;
    } catch (error) {
      console.error('DocumentChecklistService: Erro em getEmployeeDocumentChecklist:', error);
      throw error;
    }
  },

  // Buscar resumo de documentos de todos os colaboradores
  async getAllEmployeesDocumentSummary(): Promise<EmployeeDocumentSummary[]> {
    try {
      console.log('DocumentChecklistService: Buscando resumo de todos os colaboradores');
      
      const { data, error } = await supabase
        .from('employee_document_checklist')
        .select(`
          id,
          employee_id,
          required_document_id,
          document_id,
          status,
          users!employee_id(username),
          required_documents!required_document_id(name, document_type, is_mandatory),
          documents!document_id(name)
        `);

      if (error) {
        console.error('DocumentChecklistService: Erro ao buscar resumo:', error);
        throw error;
      }

      // Agrupar por colaborador
      const employeeMap = new Map<string, EmployeeDocumentSummary>();

      data?.forEach(item => {
        const employeeId = item.employee_id;
        const employeeName = item.users?.username || 'N/A';

        if (!employeeMap.has(employeeId)) {
          employeeMap.set(employeeId, {
            employee_id: employeeId,
            employee_name: employeeName,
            total_documents: 0,
            sent_documents: 0,
            validated_documents: 0,
            pending_documents: 0,
            rejected_documents: 0,
            expiring_documents: 0,
            expired_documents: 0,
            checklist_items: []
          });
        }

        const employee = employeeMap.get(employeeId)!;
        
        const checklistItem: DocumentChecklistItem = {
          id: item.id,
          employee_id: item.employee_id,
          required_document_id: item.required_document_id,
          document_id: item.document_id,
          status: item.status,
          employee_name: employeeName,
          required_document_name: item.required_documents?.name || 'N/A',
          document_type: item.required_documents?.document_type || 'N/A',
          is_mandatory: item.required_documents?.is_mandatory || false,
          uploaded_document_name: item.documents?.name || null,
        };

        employee.checklist_items.push(checklistItem);
        employee.total_documents++;

        // Contar status
        switch (item.status) {
          case 'completo':
            employee.validated_documents++;
            break;
          case 'pendente':
            employee.pending_documents++;
            break;
          case 'vencendo':
            employee.expiring_documents++;
            break;
          case 'vencido':
            employee.expired_documents++;
            break;
        }

        if (item.document_id) {
          employee.sent_documents++;
        }
      });

      const result = Array.from(employeeMap.values());
      console.log('DocumentChecklistService: Resumo encontrado para', result.length, 'colaboradores');
      return result;
    } catch (error) {
      console.error('DocumentChecklistService: Erro em getAllEmployeesDocumentSummary:', error);
      throw error;
    }
  },

  // Atualizar status de um item do checklist
  async updateChecklistItemStatus(itemId: string, status: 'pendente' | 'completo' | 'vencendo' | 'vencido'): Promise<void> {
    try {
      console.log('DocumentChecklistService: Atualizando status do item:', itemId, 'para:', status);
      
      const { error } = await supabase
        .from('employee_document_checklist')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('DocumentChecklistService: Erro ao atualizar status:', error);
        throw error;
      }

      console.log('DocumentChecklistService: Status atualizado com sucesso');
    } catch (error) {
      console.error('DocumentChecklistService: Erro em updateChecklistItemStatus:', error);
      throw error;
    }
  },

  // Associar documento a um item do checklist
  async associateDocumentToChecklistItem(itemId: string, documentId: string): Promise<void> {
    try {
      console.log('DocumentChecklistService: Associando documento:', documentId, 'ao item:', itemId);
      
      const { error } = await supabase
        .from('employee_document_checklist')
        .update({ 
          document_id: documentId,
          status: 'completo',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('DocumentChecklistService: Erro ao associar documento:', error);
        throw error;
      }

      console.log('DocumentChecklistService: Documento associado com sucesso');
    } catch (error) {
      console.error('DocumentChecklistService: Erro em associateDocumentToChecklistItem:', error);
      throw error;
    }
  },

  // Remover associação de documento de um item do checklist
  async removeDocumentFromChecklistItem(itemId: string): Promise<void> {
    try {
      console.log('DocumentChecklistService: Removendo documento do item:', itemId);
      
      const { error } = await supabase
        .from('employee_document_checklist')
        .update({ 
          document_id: null,
          status: 'pendente',
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('DocumentChecklistService: Erro ao remover documento:', error);
        throw error;
      }

      console.log('DocumentChecklistService: Documento removido com sucesso');
    } catch (error) {
      console.error('DocumentChecklistService: Erro em removeDocumentFromChecklistItem:', error);
      throw error;
    }
  },

  // Criar checklist para um novo colaborador
  async createEmployeeChecklist(employeeId: string): Promise<void> {
    try {
      console.log('DocumentChecklistService: Criando checklist para colaborador:', employeeId);
      
      // Buscar todos os documentos obrigatórios ativos
      const { data: requiredDocs, error: requiredDocsError } = await supabase
        .from('required_documents')
        .select('id')
        .eq('is_mandatory', true)
        .eq('is_active', true);

      if (requiredDocsError) {
        console.error('DocumentChecklistService: Erro ao buscar documentos obrigatórios:', requiredDocsError);
        throw requiredDocsError;
      }

      if (!requiredDocs || requiredDocs.length === 0) {
        console.log('DocumentChecklistService: Nenhum documento obrigatório encontrado');
        return;
      }

      // Verificar quais checklists já existem para este colaborador
      const { data: existingChecklists, error: existingError } = await supabase
        .from('employee_document_checklist')
        .select('required_document_id')
        .eq('employee_id', employeeId);

      if (existingError) {
        console.error('DocumentChecklistService: Erro ao verificar checklists existentes:', existingError);
        throw existingError;
      }

      const existingDocIds = new Set(existingChecklists?.map(item => item.required_document_id) || []);

      // Criar checklists apenas para documentos que ainda não existem
      const checklistsToCreate = requiredDocs
        .filter(doc => !existingDocIds.has(doc.id))
        .map(doc => ({
          employee_id: employeeId,
          required_document_id: doc.id,
          status: 'pendente' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

      if (checklistsToCreate.length === 0) {
        console.log('DocumentChecklistService: Todos os checklists já existem para este colaborador');
        return;
      }

      const { error: insertError } = await supabase
        .from('employee_document_checklist')
        .insert(checklistsToCreate);

      if (insertError) {
        console.error('DocumentChecklistService: Erro ao criar checklists:', insertError);
        throw insertError;
      }

      console.log(`DocumentChecklistService: Criados ${checklistsToCreate.length} itens de checklist para o colaborador`);
    } catch (error) {
      console.error('DocumentChecklistService: Erro em createEmployeeChecklist:', error);
      throw error;
    }
  },

  // Sincronizar checklist de um colaborador com documentos obrigatórios
  async syncEmployeeChecklist(employeeId: string): Promise<void> {
    try {
      console.log('DocumentChecklistService: Sincronizando checklist do colaborador:', employeeId);
      
      // Buscar documentos obrigatórios ativos
      const { data: requiredDocs, error: requiredDocsError } = await supabase
        .from('required_documents')
        .select('id')
        .eq('is_mandatory', true)
        .eq('is_active', true);

      if (requiredDocsError) {
        console.error('DocumentChecklistService: Erro ao buscar documentos obrigatórios:', requiredDocsError);
        throw requiredDocsError;
      }

      const requiredDocIds = new Set(requiredDocs?.map(doc => doc.id) || []);

      // Buscar checklist atual do colaborador
      const { data: currentChecklist, error: checklistError } = await supabase
        .from('employee_document_checklist')
        .select('id, required_document_id')
        .eq('employee_id', employeeId);

      if (checklistError) {
        console.error('DocumentChecklistService: Erro ao buscar checklist atual:', checklistError);
        throw checklistError;
      }

      // Identificar itens a serem adicionados
      const currentDocIds = new Set(currentChecklist?.map(item => item.required_document_id) || []);
      const itemsToAdd = Array.from(requiredDocIds).filter(docId => !currentDocIds.has(docId));

      // Identificar itens a serem removidos (documentos que não são mais obrigatórios)
      const itemsToRemove = currentChecklist?.filter(item => !requiredDocIds.has(item.required_document_id)) || [];

      // Adicionar novos itens
      if (itemsToAdd.length > 0) {
        const checklistsToCreate = itemsToAdd.map(docId => ({
          employee_id: employeeId,
          required_document_id: docId,
          status: 'pendente' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('employee_document_checklist')
          .insert(checklistsToCreate);

        if (insertError) {
          console.error('DocumentChecklistService: Erro ao adicionar novos itens:', insertError);
          throw insertError;
        }

        console.log(`DocumentChecklistService: Adicionados ${itemsToAdd.length} novos documentos ao checklist`);
      }

      // Remover itens obsoletos
      if (itemsToRemove.length > 0) {
        const idsToRemove = itemsToRemove.map(item => item.id);

        const { error: deleteError } = await supabase
          .from('employee_document_checklist')
          .delete()
          .in('id', idsToRemove);

        if (deleteError) {
          console.error('DocumentChecklistService: Erro ao remover itens obsoletos:', deleteError);
          throw deleteError;
        }

        console.log(`DocumentChecklistService: Removidos ${itemsToRemove.length} documentos obsoletos do checklist`);
      }

      console.log('DocumentChecklistService: Checklist do colaborador sincronizado com sucesso');
    } catch (error) {
      console.error('DocumentChecklistService: Erro em syncEmployeeChecklist:', error);
      throw error;
    }
  },

  // Buscar status de documentos usando a nova view
  async getUserRequiredDocuments(userId?: string): Promise<any[]> {
    try {
      console.log('DocumentChecklistService: Buscando documentos obrigatórios via view:', userId);
      
      let query = supabase
        .from('user_required_documents')
        .select('*')
        .order('username', { ascending: true })
        .order('document_name', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('DocumentChecklistService: Erro ao buscar via view:', error);
        throw error;
      }

      console.log('DocumentChecklistService: Dados da view encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('DocumentChecklistService: Erro em getUserRequiredDocuments:', error);
      throw error;
    }
  },

  // Sincronizar documentos obrigatórios
  async syncUserRequiredDocuments(): Promise<void> {
    try {
      console.log('DocumentChecklistService: Executando sincronização de documentos obrigatórios');
      
      const { error } = await supabase.rpc('sync_user_required_documents');

      if (error) {
        console.error('DocumentChecklistService: Erro na sincronização:', error);
        throw error;
      }

      console.log('DocumentChecklistService: Sincronização concluída com sucesso');
    } catch (error) {
      console.error('DocumentChecklistService: Erro em syncUserRequiredDocuments:', error);
      throw error;
    }
  }
};