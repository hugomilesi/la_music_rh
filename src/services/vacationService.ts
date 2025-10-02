
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
      const { data, error } = await supabase
        .from('vacation_requests')
        .select(`
          *,
          employee:colaboradores!employee_id(nome)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data?.map(request => ({
        id: request.id,
        employeeId: request.employee_id,
        employeeName: request.employee?.nome || 'Unknown',
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
      throw error;
    }
  },

  async getVacationBalances(): Promise<VacationBalance[]> {
    try {
      const { data, error } = await supabase
        .from('vacation_balances')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
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
    } catch (error) {
      throw error;
    }
  },

  async createVacationRequest(requestData: NewVacationRequest): Promise<VacationRequest> {
    try {
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
        days_requested: daysDiff,
        reason: requestData.reason,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .insert(insertData)
        .select(`
          *,
          employee:colaboradores!employee_id(nome)
        `)
        .single();

      if (error) {
        throw error;
      }

      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.nome || 'Unknown',
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
      throw error;
    }
  },

  async updateVacationRequest(id: string, updateData: Partial<VacationRequest>): Promise<VacationRequest> {
    try {
      const updateFields: any = {};
      
      if (updateData.startDate) updateFields.start_date = updateData.startDate;
      if (updateData.endDate) updateFields.end_date = updateData.endDate;
      if (updateData.reason) updateFields.reason = updateData.reason;
      if (updateData.status) updateFields.status = translateStatusToDb(updateData.status);
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
          employee:colaboradores!employee_id(nome)
        `)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.nome || 'Unknown',
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
      // Get current user info to validate approver
      const { data: approver, error: approverError } = await supabase
        .from('users')
        .select('id, username')
        .eq('auth_user_id', approvedBy)
        .single();

      if (approverError || !approver) {
        throw new Error('Usuário aprovador não encontrado');
      }

      const updateData = {
        status: 'approved',
        approved_by: approver.id, // Store the user's internal ID, not auth_user_id
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:colaboradores!employee_id(nome),
          approved_by_user:users!approved_by(username)
        `)
        .single();

      if (error) {
        throw error;
      }

      // TODO: Update vacation balance when approved
      // This should be implemented based on your business logic
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.nome || 'Funcionário não encontrado',
        startDate: data.start_date,
        endDate: data.end_date,
        daysRequested: data.days_requested,
        reason: data.reason,
        status: data.status,
        approvedBy: data.approved_by,
        approvedByName: data.approved_by_user?.username || null,
        approvedAt: data.approved_at,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw error;
    }
  },

  async rejectVacationRequest(id: string, rejectionReason: string, rejectedBy: string): Promise<VacationRequest> {
    try {
      // Get current user info to validate rejector
      const { data: rejector, error: rejectorError } = await supabase
        .from('users')
        .select('id, username')
        .eq('auth_user_id', rejectedBy)
        .single();

      if (rejectorError || !rejector) {
        throw new Error('Usuário que está rejeitando não encontrado');
      }

      const updateData = {
        status: 'rejected',
        approved_by: rejector.id, // Store the user's internal ID, not auth_user_id
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employee:colaboradores!employee_id(nome),
          approved_by_user:users!approved_by(username)
        `)
        .single();

      if (error) {
        throw error;
      }
      
      return {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee?.nome || 'Funcionário não encontrado',
        startDate: data.start_date,
        endDate: data.end_date,
        daysRequested: data.days_requested,
        reason: data.reason,
        status: data.status,
        approvedBy: data.approved_by,
        approvedByName: data.approved_by_user?.username || null,
        approvedAt: data.approved_at,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      throw error;
    }
  }
};
