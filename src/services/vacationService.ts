
import { supabase } from '@/integrations/supabase/client';
import { VacationRequest, VacationBalance, NewVacationRequest } from '@/types/vacation';

// Helper function to translate status from database to frontend
const translateStatus = (dbStatus: string): VacationRequest['status'] => {
  const statusMap: Record<string, VacationRequest['status']> = {
    'pending': 'pendente',
    'approved': 'aprovado',
    'rejected': 'rejeitado'
  };
  return statusMap[dbStatus] || dbStatus as VacationRequest['status'];
};

// Helper function to translate status from frontend to database
const translateStatusToDb = (frontendStatus: VacationRequest['status']): string => {
  const statusMap: Record<VacationRequest['status'], string> = {
    'pendente': 'pending',
    'aprovado': 'approved',
    'rejeitado': 'rejected'
  };
  return statusMap[frontendStatus] || frontendStatus;
};

export const vacationService = {
  async getVacationRequests(): Promise<VacationRequest[]> {
    try {
      console.log('🔄 VacationService: Buscando solicitações de férias');
      
      const { data, error } = await supabase
        .from('vacation_requests')
        .select(`
          *,
          employee:users!employee_id(username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ VacationService: Erro ao buscar solicitações:', error);
        throw error;
      }
      
      console.log(`✅ VacationService: ${data?.length || 0} solicitações encontradas`);
      return data?.map(request => ({
        id: request.id,
        employeeId: request.employee_id,
        employeeName: request.employee?.username || 'Unknown',
        startDate: request.start_date,
        endDate: request.end_date,
        days: request.days_requested,
        reason: request.reason || 'Férias',
        status: translateStatus(request.status),
        requestDate: request.created_at ? new Date(request.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        approvedBy: request.approved_by,
        approvedDate: request.approved_at?.split('T')[0],
        rejectionReason: request.rejection_reason || '',
        type: (request.request_type as VacationRequest['type']) || 'vacation'
      })) || [];
    } catch (error) {
      console.error('❌ VacationService: Erro ao buscar solicitações de férias:', error);
      throw error;
    }
  },

  async getVacationBalances(): Promise<VacationBalance[]> {
    try {
      console.log('🔄 VacationService: Buscando saldos de férias');
      
      const { data, error } = await supabase
        .from('vacation_balances')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ VacationService: Erro ao buscar saldos:', error);
        throw error;
      }
      
      console.log(`✅ VacationService: ${data?.length || 0} saldos encontrados`);
      return data?.map(balance => ({
        employeeId: balance.employee_id,
        totalDays: balance.total_days || 30,
        usedDays: balance.used_days || 0,
        remainingDays: balance.remaining_days || ((balance.total_days || 30) - (balance.used_days || 0)),
        yearlyAllowance: balance.yearly_allowance || 30,
        expirationDate: balance.expiration_date
      })) || [];
    } catch (error) {
      console.error('❌ VacationService: Erro ao buscar saldos de férias:', error);
      throw error;
    }
  },

  async createVacationRequest(requestData: NewVacationRequest): Promise<VacationRequest> {
    try {
      console.log('🔄 VacationService: Criando solicitação de férias');
      
      // Validate UUID format for employeeId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestData.employeeId)) {
        console.error('❌ VacationService: Formato de employeeId inválido');
        throw new Error('Invalid employeeId format. Must be a valid UUID.');
      }

      // Calculate days between start and end date
      const startDate = new Date(requestData.startDate);
      const endDate = new Date(requestData.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates

      const insertData = {
        employee_id: requestData.employeeId,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        days_requested: daysDiff,
        reason: requestData.reason,
        request_type: requestData.type || 'vacation',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .insert(insertData)
        .select(`
          *,
          employee:users!employee_id(username)
        `)
        .single();

      if (error) {
        console.error('❌ VacationService: Erro ao criar solicitação:', error);
        throw error;
      }

      console.log('✅ VacationService: Solicitação criada com sucesso');
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || 'Unknown',
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days_requested,
        reason: data.reason || 'Férias',
        status: translateStatus(data.status),
        requestDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        approvedBy: data.approved_by,
        approvedDate: data.approved_at?.split('T')[0],
        rejectionReason: data.rejection_reason || '',
        type: (data.request_type as VacationRequest['type']) || 'vacation'
      };
    } catch (error) {
      console.error('❌ VacationService: Erro ao criar solicitação de férias:', error);
      throw error;
    }
  },

  async updateVacationRequest(id: string, updateData: Partial<VacationRequest>): Promise<VacationRequest> {
    try {
      console.log('🔄 VacationService: Atualizando solicitação de férias');
      
      const updateFields: any = {};
      
      if (updateData.startDate) updateFields.start_date = updateData.startDate;
      if (updateData.endDate) updateFields.end_date = updateData.endDate;
      if (updateData.reason) updateFields.reason = updateData.reason;
      if (updateData.status) updateFields.status = translateStatusToDb(updateData.status);
      if (updateData.type) updateFields.request_type = updateData.type;
      if (updateData.rejectionReason) updateFields.rejection_reason = updateData.rejectionReason;
      if (updateData.approvedBy) updateFields.approved_by = updateData.approvedBy;
      if (updateData.approvedDate) updateFields.approved_at = updateData.approvedDate;
      
      // Recalculate days if dates are updated
      if (updateData.startDate && updateData.endDate) {
        const startDate = new Date(updateData.startDate);
        const endDate = new Date(updateData.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        updateFields.days_requested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      }
      
      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateFields)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(username)
        `)
        .single();
      
      if (error) {
        console.error('❌ VacationService: Erro ao atualizar solicitação:', error);
        throw error;
      }
      
      console.log('✅ VacationService: Solicitação atualizada com sucesso');
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || 'Unknown',
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days_requested,
        reason: data.reason || 'Férias',
        status: translateStatus(data.status),
        requestDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        approvedBy: data.approved_by,
        approvedDate: data.approved_at?.split('T')[0],
        rejectionReason: data.rejection_reason || '',
        type: (data.request_type as VacationRequest['type']) || 'vacation'
      };
    } catch (error) {
      console.error('❌ VacationService: Erro ao atualizar solicitação de férias:', error);
      throw error;
    }
  },

  async deleteVacationRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('vacation_requests')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erro ao excluir solicitação: ${error.message}`);
    }
  },

  async approveVacationRequest(id: string, approvedBy: string): Promise<VacationRequest> {
    try {
      console.log('🔄 VacationService: Aprovando solicitação de férias');
      
      // Validate that approvedBy user exists
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', approvedBy)
        .single();
      
      if (userError || !userExists) {
        console.error('❌ VacationService: Usuário aprovador não encontrado');
        throw new Error('Usuário aprovador não encontrado no sistema. Verifique se você está logado corretamente.');
      }

      const updateData = {
        status: 'approved',
        approved_by: approvedBy,
        approved_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(username)
        `)
        .single();

      if (error) {
        console.error('❌ VacationService: Erro ao aprovar solicitação:', error);
        if (error.code === '23503') {
          throw new Error('Erro de referência: Usuário aprovador não encontrado no sistema.');
        }
        throw new Error(`Erro ao aprovar solicitação: ${error.message}`);
      }

      console.log('✅ VacationService: Solicitação aprovada com sucesso');
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || 'Unknown',
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days_requested,
        reason: data.reason || 'Férias',
        status: translateStatus(data.status),
        requestDate: data.request_date || (data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        approvedBy: data.approved_by,
        approvedDate: data.approved_date,
        rejectionReason: data.rejection_reason || '',
        type: (data.request_type as VacationRequest['type']) || 'vacation'
      };
    } catch (error) {
      console.error('❌ VacationService: Erro ao aprovar solicitação de férias:', error);
      throw error;
    }
  },

  async rejectVacationRequest(id: string, rejectionReason: string, rejectedBy: string): Promise<VacationRequest> {
    try {
      console.log('🔄 VacationService: Rejeitando solicitação de férias');
      
      // Validate that rejectedBy user exists
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', rejectedBy)
        .single();
      
      if (userError || !userExists) {
        console.error('❌ VacationService: Usuário que está rejeitando não encontrado');
        throw new Error('Usuário que está rejeitando não encontrado no sistema. Verifique se você está logado corretamente.');
      }

      const updateData = {
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejected_by: rejectedBy,
        rejected_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:users!employee_id(username)
        `)
        .single();

      if (error) {
        console.error('❌ VacationService: Erro ao rejeitar solicitação:', error);
        if (error.code === '23503') {
          throw new Error('Erro de referência: Usuário que está rejeitando não encontrado no sistema.');
        }
        throw new Error(`Erro ao rejeitar solicitação: ${error.message}`);
      }

      console.log('✅ VacationService: Solicitação rejeitada com sucesso');
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.username || 'Unknown',
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days_requested,
        reason: data.reason || 'Férias',
        status: translateStatus(data.status),
        requestDate: data.request_date || (data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        approvedBy: data.approved_by,
        approvedDate: data.approved_date,
        rejectionReason: data.rejection_reason || '',
        type: (data.request_type as VacationRequest['type']) || 'vacation'
      };
    } catch (error) {
      console.error('❌ VacationService: Erro ao rejeitar solicitação de férias:', error);
      throw error;
    }
  }
};
