import { supabase } from '@/integrations/supabase/client';

export interface DocumentChecklistItem {
  id: string;
  employee_id: string;
  required_document_id: string;
  document_id: string | null;
  status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado';
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
  checklist_items: DocumentChecklistItem[];
}

export const documentChecklistService = {
  // Buscar checklist de documentos por colaborador usando a nova lógica simplificada
  async getEmployeeDocumentChecklist(employeeId: string): Promise<DocumentChecklistItem[]> {
    // Buscar colaborador
    const { data: employee, error: employeeError } = await supabase
      .from('colaboradores')
      .select('id, nome')
      .eq('id', employeeId)
      .single();

    if (employeeError) {
      throw employeeError;
    }

    // Buscar apenas os documentos obrigatórios com LEFT JOIN para documentos enviados
    const { data, error } = await supabase
      .from('required_documents')
      .select(`
        id,
        name,
        document_type,
        is_mandatory,
        documents!left(
          id,
          name,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('is_active', true)
      .eq('is_mandatory', true)
      .eq('documents.employee_id', employeeId)
      .order('name');

    if (error) {
      throw error;
    }
    
    // Transform data to match DocumentChecklistItem interface
    const transformedData = data?.map(item => {
      const document = Array.isArray(item.documents) ? item.documents[0] : item.documents;
      return {
        id: document?.id || item.id, // Use document ID if exists, otherwise required_document ID
        employee_id: employeeId,
        required_document_id: item.id,
        document_id: document?.id || null,
        status: document?.status || 'pendente',
        employee_name: employee.nome,
        required_document_name: item.name,
        document_type: item.document_type,
        is_mandatory: item.is_mandatory,
        uploaded_document_name: document?.name || null,
        created_at: document?.created_at || null,
        updated_at: document?.updated_at || null
      };
    }) || [];
    
    return transformedData;
  },

  // Buscar resumo de documentos de todos os colaboradores
  async getAllEmployeesDocumentSummary(): Promise<EmployeeDocumentSummary[]> {
    // Buscar todos os colaboradores ativos
    const { data: employees, error: employeesError } = await supabase
      .from('colaboradores')
      .select('id, nome, email')
      .eq('status', 'ativo')
      .order('nome');

    if (employeesError) {
      throw employeesError;
    }

    // Para cada colaborador, buscar seu checklist
    const summaries: EmployeeDocumentSummary[] = [];
    
    for (const employee of employees || []) {
      const checklistItems = await this.getEmployeeDocumentChecklist(employee.id);
      
      const summary: EmployeeDocumentSummary = {
        employee_id: employee.id,
        employee_name: employee.nome,
        total_documents: checklistItems.length,
        sent_documents: checklistItems.filter(item => item.status === 'enviado' || item.status === 'aprovado').length,
        validated_documents: checklistItems.filter(item => item.status === 'aprovado').length,
        pending_documents: checklistItems.filter(item => item.status === 'pendente').length,
        rejected_documents: checklistItems.filter(item => item.status === 'rejeitado').length,
        checklist_items: checklistItems
      };
      
      summaries.push(summary);
    }

    return summaries;
  },

  // Buscar resumo apenas de colaboradores com documentos enviados
  async getEmployeesWithDocumentsSummary(): Promise<EmployeeDocumentSummary[]> {
    // Buscar todos os colaboradores ativos
    const { data: employees, error } = await supabase
      .from('colaboradores')
      .select('id, nome, email')
      .eq('status', 'ativo')
      .order('nome');

    if (error) {
      throw error;
    }

    // Para cada colaborador, buscar seu resumo completo
    const summaries: EmployeeDocumentSummary[] = [];
    
    for (const employee of employees || []) {
      const checklistItems = await this.getEmployeeDocumentChecklist(employee.id);
      
      // Só incluir colaboradores que têm documentos enviados/aprovados OU documentos pendentes obrigatórios
      const hasSentDocuments = checklistItems.some(item => item.status === 'enviado' || item.status === 'aprovado');
      const hasPendingMandatory = checklistItems.some(item => item.status === 'pendente' && item.is_mandatory);
      
      if (hasSentDocuments || hasPendingMandatory) {
        const summary: EmployeeDocumentSummary = {
          employee_id: employee.id,
          employee_name: employee.nome,
          total_documents: checklistItems.length,
          sent_documents: checklistItems.filter(item => item.status === 'enviado' || item.status === 'aprovado').length,
          validated_documents: checklistItems.filter(item => item.status === 'aprovado').length,
          pending_documents: checklistItems.filter(item => item.status === 'pendente').length,
          rejected_documents: checklistItems.filter(item => item.status === 'rejeitado').length,
          checklist_items: checklistItems
        };
        
        summaries.push(summary);
      }
    }

    return summaries;
  },

  // Atualizar status de um documento
  async updateDocumentStatus(documentId: string, status: 'pendente' | 'enviado' | 'aprovado' | 'rejeitado'): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      throw error;
    }
  },

  // Buscar documentos pendentes para um colaborador (apenas documentos obrigatórios não enviados)
  async getPendingDocuments(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('required_documents')
      .select(`
        id,
        name,
        document_type,
        description,
        is_mandatory
      `)
      .eq('is_active', true)
      .eq('is_mandatory', true)
      .not('id', 'in', 
        `(SELECT required_document_id FROM documents WHERE employee_id = '${employeeId}' AND required_document_id IS NOT NULL)`
      );

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Buscar documentos enviados para um colaborador
  async getSentDocuments(employeeId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        required_document:required_documents(
          id,
          name,
          document_type,
          description
        )
      `)
      .eq('employee_id', employeeId)
      .not('required_document_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }
};