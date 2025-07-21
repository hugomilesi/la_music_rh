
import { supabase } from '@/integrations/supabase/client';
import { VacationRequest, VacationBalance, NewVacationRequest } from '@/types/vacation';

export const vacationService = {
  async getVacationRequests(): Promise<VacationRequest[]> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vacation requests:', error);
      throw error;
    }
    
    return data?.map(request => ({
      id: request.id,
      employeeId: request.employee_id,
      employeeName: request.employee?.name || 'Unknown',
      startDate: request.start_date || request.data_inicio,
      endDate: request.end_date || request.data_fim,
      days: request.days_requested || request.days,
      reason: request.notes || request.observacoes || 'Férias',
      status: request.status as VacationRequest['status'],
      requestDate: request.created_at ? new Date(request.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      approvedBy: request.approved_by || request.aprovador_id,
      approvedDate: request.approved_date || request.data_aprovacao || request.updated_at?.split('T')[0],
      rejectionReason: request.rejection_reason || '',
      type: (request.type as VacationRequest['type']) || 'vacation'
    })) || [];
  },

  async getVacationBalances(): Promise<VacationBalance[]> {
    const { data, error } = await supabase
      .from('vacation_balances')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vacation balances:', error);
      throw error;
    }
    
    return data?.map(balance => ({
      employeeId: balance.employee_id,
      totalDays: balance.dias_totais || balance.total_days || 30,
      usedDays: balance.dias_gozados || balance.used_days || 0,
      remainingDays: (balance.dias_totais || 30) - (balance.dias_gozados || 0),
      yearlyAllowance: balance.dias_totais || balance.yearly_allowance || 30,
      expirationDate: balance.vencimento || balance.expiration_date
    })) || [];
  },

  async createVacationRequest(requestData: NewVacationRequest): Promise<VacationRequest> {
    console.log('🔍 createVacationRequest: Starting to create vacation request with data:', requestData);
    
    // Validate UUID format for employeeId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestData.employeeId)) {
      throw new Error('Invalid employeeId format. Must be a valid UUID.');
    }

    // Calculate days between start and end date
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates

    const insertData = {
      employee_id: requestData.employeeId,
      data_inicio: requestData.startDate,
      data_fim: requestData.endDate,
      days: daysDiff,
      observacoes: requestData.reason,
      type: requestData.type || 'vacation',
      status: 'pendente'
    };

    console.log('🔍 createVacationRequest: Insert data prepared:', insertData);

    const { data, error } = await supabase
      .from('vacation_requests')
      .insert(insertData)
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error('❌ createVacationRequest: Error creating vacation request:', error);
      throw error;
    }

    console.log('✅ createVacationRequest: Vacation request created successfully:', data);

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.name || 'Unknown',
      startDate: data.start_date || data.data_inicio,
      endDate: data.end_date || data.data_fim,
      days: data.days_requested || data.days,
      reason: data.notes || data.observacoes || 'Férias',
      status: data.status as VacationRequest['status'],
      requestDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      approvedBy: data.approved_by || data.aprovador_id,
      approvedDate: data.approved_date || data.data_aprovacao,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  },

  async updateVacationRequest(id: string, updateData: Partial<VacationRequest>): Promise<VacationRequest> {
    const updateFields: any = {};
    
    if (updateData.startDate) updateFields.data_inicio = updateData.startDate;
    if (updateData.endDate) updateFields.data_fim = updateData.endDate;
    if (updateData.reason) updateFields.observacoes = updateData.reason;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.type) updateFields.type = updateData.type;
    if (updateData.rejectionReason) updateFields.rejection_reason = updateData.rejectionReason;
    if (updateData.approvedBy) updateFields.aprovador_id = updateData.approvedBy;
    if (updateData.approvedDate) updateFields.data_aprovacao = updateData.approvedDate;
    
    // Recalculate days if dates are updated
    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      const timeDiff = endDate.getTime() - startDate.getTime();
      updateFields.days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    }
    
    const { data, error } = await supabase
      .from('vacation_requests')
      .update(updateFields)
      .eq('id', id)
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating vacation request:', error);
      throw error;
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.name || 'Unknown',
      startDate: data.start_date || data.data_inicio,
      endDate: data.end_date || data.data_fim,
      days: data.days_requested || data.days,
      reason: data.notes || data.observacoes || 'Férias',
      status: data.status as VacationRequest['status'],
      requestDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      approvedBy: data.approved_by || data.aprovador_id,
      approvedDate: data.approved_date || data.data_aprovacao,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  },

  async deleteVacationRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('vacation_requests')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting vacation request:', error);
      throw error;
    }
  },

  async approveVacationRequest(id: string, approvedBy: string): Promise<VacationRequest> {
    const updateData = {
      status: 'aprovado',
      aprovador_id: approvedBy,
      data_aprovacao: new Date().toISOString().split('T')[0]
    };

    const { data, error } = await supabase
      .from('vacation_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error('Error approving vacation request:', error);
      throw error;
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.name || 'Unknown',
      startDate: data.start_date || data.data_inicio,
      endDate: data.end_date || data.data_fim,
      days: data.days_requested || data.days,
      reason: data.notes || data.observacoes || 'Férias',
      status: data.status as VacationRequest['status'],
      requestDate: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      approvedBy: data.approved_by || data.aprovador_id,
      approvedDate: data.approved_date || data.data_aprovacao,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  },

  async rejectVacationRequest(id: string, rejectionReason: string): Promise<VacationRequest> {
    const updateData = {
      status: 'rejeitado',
      rejection_reason: rejectionReason
    };

    const { data, error } = await supabase
      .from('vacation_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error('Error rejecting vacation request:', error);
      throw error;
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.name || 'Unknown',
      startDate: data.start_date || data.data_inicio,
      endDate: data.end_date || data.data_fim,
      days: data.days_requested || data.days,
      reason: data.notes || data.observacoes || 'Férias',
      status: data.status as VacationRequest['status'],
      requestDate: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      approvedBy: data.approved_by || data.aprovador_id,
      approvedDate: data.approved_date || data.data_aprovacao,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  }
};
