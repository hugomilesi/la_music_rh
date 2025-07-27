
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
    const { data, error } = await supabase
      .from('vacation_requests')
      .select(`
        *,
        employee:users!employee_id(full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching vacation requests:', error);
      throw error;
    }
    
    return data?.map(request => ({
      id: request.id,
      employeeId: request.employee_id,
      employeeName: request.employee?.full_name || 'Unknown',
      startDate: request.start_date,
      endDate: request.end_date,
      days: request.days,
      reason: request.reason || 'Férias',
      status: translateStatus(request.status),
      requestDate: request.request_date || (request.created_at ? new Date(request.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      approvedBy: request.approved_by,
      approvedDate: request.approved_date || request.updated_at?.split('T')[0],
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
      totalDays: balance.total_days || 30,
      usedDays: balance.used_days || 0,
      remainingDays: balance.remaining_days || ((balance.total_days || 30) - (balance.used_days || 0)),
      yearlyAllowance: balance.yearly_allowance || 30,
      expirationDate: balance.expiration_date
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
      start_date: requestData.startDate,
      end_date: requestData.endDate,
      days: daysDiff,
      reason: requestData.reason,
      type: requestData.type || 'vacation',
      status: 'pending'
    };

    console.log('🔍 createVacationRequest: Insert data prepared:', insertData);

    const { data, error } = await supabase
      .from('vacation_requests')
      .insert(insertData)
      .select(`
        *,
        employee:users!employee_id(full_name)
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
      employeeName: data.employee?.full_name || 'Unknown',
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason || 'Férias',
      status: translateStatus(data.status),
      requestDate: data.request_date || (data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  },

  async updateVacationRequest(id: string, updateData: Partial<VacationRequest>): Promise<VacationRequest> {
    const updateFields: any = {};
    
    if (updateData.startDate) updateFields.start_date = updateData.startDate;
    if (updateData.endDate) updateFields.end_date = updateData.endDate;
    if (updateData.reason) updateFields.reason = updateData.reason;
    if (updateData.status) updateFields.status = translateStatusToDb(updateData.status);
    if (updateData.type) updateFields.type = updateData.type;
    if (updateData.rejectionReason) updateFields.rejection_reason = updateData.rejectionReason;
    if (updateData.approvedBy) updateFields.approved_by = updateData.approvedBy;
    if (updateData.approvedDate) updateFields.approved_date = updateData.approvedDate;
    
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
        employee:users!employee_id(full_name)
      `)
      .single();
    
    if (error) {
      console.error('Error updating vacation request:', error);
      throw error;
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.full_name || 'Unknown',
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason || 'Férias',
      status: translateStatus(data.status),
      requestDate: data.request_date || (data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
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
        employee:users!employee_id(full_name)
      `)
      .single();

    if (error) {
      console.error('Error approving vacation request:', error);
      throw error;
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.full_name || 'Unknown',
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason || 'Férias',
      status: translateStatus(data.status),
      requestDate: data.request_date || (data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  },

  async rejectVacationRequest(id: string, rejectionReason: string): Promise<VacationRequest> {
    const updateData = {
      status: 'rejected',
      rejection_reason: rejectionReason
    };

    const { data, error } = await supabase
      .from('vacation_requests')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        employee:users!employee_id(full_name)
      `)
      .single();

    if (error) {
      console.error('Error rejecting vacation request:', error);
      throw error;
    }

    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.full_name || 'Unknown',
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason || 'Férias',
      status: translateStatus(data.status),
      requestDate: data.request_date || (data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]),
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
      rejectionReason: data.rejection_reason || '',
      type: (data.type as VacationRequest['type']) || 'vacation'
    };
  }
};
