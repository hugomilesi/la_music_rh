
import { supabase } from '@/integrations/supabase/client';
import { VacationRequest, VacationBalance, NewVacationRequest } from '@/types/vacation';

export const vacationService = {
  async getVacationRequests(): Promise<VacationRequest[]> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name),
        approver:employees!vacation_requests_approved_by_fkey(name)
      `)
      .order('request_date', { ascending: false });
    
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
      approvedBy: request.approver?.name,
      approvedDate: request.approved_date,
      rejectionReason: request.rejection_reason,
      type: request.type as VacationRequest['type']
    })) || [];
  },

  async getVacationBalances(): Promise<VacationBalance[]> {
    const { data, error } = await supabase
      .from('vacation_balances')
      .select(`
        *,
        employee:employees!vacation_balances_employee_id_fkey(name)
      `);
    
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
    const { data, error } = await supabase
      .from('vacation_requests')
      .insert([{
        employee_id: requestData.employeeId,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        days: this.calculateDays(requestData.startDate, requestData.endDate),
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
      type: data.type as VacationRequest['type']
    };
  },

  async updateVacationRequest(id: string, updates: Partial<VacationRequest>): Promise<VacationRequest> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .update({
        status: updates.status,
        approved_by: updates.approvedBy ? 
          (await this.getEmployeeIdByName(updates.approvedBy)) : undefined,
        approved_date: updates.status === 'approved' ? new Date().toISOString().split('T')[0] : null,
        rejection_reason: updates.rejectionReason
      })
      .eq('id', id)
      .select(`
        *,
        employee:employees!vacation_requests_employee_id_fkey(name),
        approver:employees!vacation_requests_approved_by_fkey(name)
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
      approvedBy: data.approver?.name,
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
  },

  // Helper methods
  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  },

  async getEmployeeIdByName(name: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('name', name)
      .single();
    
    if (error) return null;
    return data?.id || null;
  }
};
