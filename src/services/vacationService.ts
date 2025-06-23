
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
      startDate: request.start_date,
      endDate: request.end_date,
      days: request.days,
      reason: request.reason,
      status: request.status as VacationRequest['status'],
      requestDate: request.request_date,
      approvedBy: request.approved_by,
      approvedDate: request.approved_date,
      rejectionReason: request.rejection_reason,
      type: request.type as VacationRequest['type']
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
      totalDays: balance.total_days,
      usedDays: balance.used_days,
      remainingDays: balance.remaining_days,
      yearlyAllowance: balance.yearly_allowance,
      expirationDate: balance.expiration_date
    })) || [];
  },

  async createVacationRequest(requestData: NewVacationRequest): Promise<VacationRequest> {
    // Calculate days between start and end date
    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const { data, error } = await supabase
      .from('vacation_requests')
      .insert([{
        employee_id: requestData.employeeId,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        days,
        reason: requestData.reason,
        type: requestData.type
      }])
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name)
      `)
      .single();
    
    if (error) {
      console.error('Error creating vacation request:', error);
      throw error;
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee?.name || 'Unknown',
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason,
      status: data.status as VacationRequest['status'],
      requestDate: data.request_date,
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
      rejectionReason: data.rejection_reason,
      type: data.type as VacationRequest['type']
    };
  },

  async updateVacationRequest(id: string, updates: Partial<VacationRequest>): Promise<VacationRequest> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .update({
        start_date: updates.startDate,
        end_date: updates.endDate,
        days: updates.days,
        reason: updates.reason,
        status: updates.status,
        approved_by: updates.approvedBy,
        approved_date: updates.approvedDate,
        rejection_reason: updates.rejectionReason,
        type: updates.type
      })
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
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason,
      status: data.status as VacationRequest['status'],
      requestDate: data.request_date,
      approvedBy: data.approved_by,
      approvedDate: data.approved_date,
      rejectionReason: data.rejection_reason,
      type: data.type as VacationRequest['type']
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
  }
};
