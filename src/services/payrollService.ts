
import { supabase } from '@/integrations/supabase/client';
import type { Payroll, PayrollEntry, Unit, PayrollAllocation, PayrollFilters } from '@/types/payroll';

export const payrollService = {
  // Payroll Cycles
  async getPayrolls(): Promise<Payroll[]> {
    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPayroll(month: number, year: number): Promise<Payroll | null> {
    const { data, error } = await supabase
      .from('payrolls')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createPayroll(month: number, year: number, duplicateFrom?: { month: number; year: number }): Promise<Payroll> {
    const { data, error } = await supabase
      .from('payrolls')
      .insert({ month, year })
      .select()
      .single();

    if (error) throw error;

    // Create payroll entries
    if (duplicateFrom) {
      await this.duplicatePayrollEntries(data.id, duplicateFrom);
    } else {
      await this.createPayrollEntries(data.id);
    }

    return data;
  },

  async updatePayrollStatus(id: string, status: 'draft' | 'approved' | 'paid'): Promise<void> {
    const { error } = await supabase
      .from('payrolls')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  async deletePayroll(id: string): Promise<void> {
    // First delete related entries
    const { error: entriesError } = await supabase
      .from('folha_pagamento')
      .delete()
      .eq('payroll_id', id);

    if (entriesError) throw entriesError;

    // Then delete the payroll
    const { error } = await supabase
      .from('payrolls')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Payroll Entries
  async getPayrollEntries(month: number, year: number, filters?: PayrollFilters): Promise<PayrollEntry[]> {
    let query = supabase
      .from('payroll_full_view')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .order('collaborator_name');

    if (filters?.name) {
      query = query.ilike('collaborator_name', `%${filters.name}%`);
    }

    if (filters?.classification) {
      query = query.eq('classification', filters.classification);
    }

    if (filters?.role) {
      query = query.ilike('role', `%${filters.role}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async updatePayrollEntry(id: string, updates: Partial<PayrollEntry>): Promise<void> {
    const { error } = await supabase
      .from('folha_pagamento')
      .update({
        salario_base: updates.base_salary,
        bonus: updates.bonus,
        comissao: updates.commission,
        reembolso: updates.reimbursement,
        passagem: updates.transport_voucher,
        inss: updates.inss,
        lojinha: updates.store_expenses,
        bistro: updates.bistro_expenses,
        adiantamento: updates.salary_advance,
        outros_descontos: updates.other_discounts,
        observacoes: updates.notes,
        classificacao: updates.classification,
        funcao: updates.role,
      })
      .eq('id', id);

    if (error) throw error;
  },

  async createPayrollEntries(payrollId: string): Promise<void> {
    // Get all active employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, name, position')
      .eq('status', 'active');

    if (employeesError) throw employeesError;

    // Create payroll entries for all employees
    const entries = employees.map(employee => ({
      payroll_id: payrollId,
      colaborador_id: employee.id,
      funcao: employee.position,
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
      salario_base: 0,
      bonus: 0,
      comissao: 0,
      reembolso: 0,
      passagem: 0,
      inss: 0,
      lojinha: 0,
      bistro: 0,
      adiantamento: 0,
      outros_descontos: 0,
      status: 'rascunho'
    }));

    const { error } = await supabase
      .from('folha_pagamento')
      .insert(entries);

    if (error) throw error;
  },

  async duplicatePayrollEntries(newPayrollId: string, duplicateFrom: { month: number; year: number }): Promise<void> {
    // Get entries from source payroll
    const { data: sourceEntries, error: sourceError } = await supabase
      .from('folha_pagamento')
      .select('*')
      .eq('mes', duplicateFrom.month)
      .eq('ano', duplicateFrom.year);

    if (sourceError) throw sourceError;

    if (sourceEntries && sourceEntries.length > 0) {
      // Create new entries based on source
      const newEntries = sourceEntries.map(entry => ({
        payroll_id: newPayrollId,
        colaborador_id: entry.colaborador_id,
        funcao: entry.funcao,
        classificacao: entry.classificacao,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        salario_base: entry.salario_base,
        bonus: 0, // Reset variable amounts
        comissao: 0,
        reembolso: 0,
        passagem: entry.passagem, // Keep fixed amounts
        inss: entry.inss,
        lojinha: 0,
        bistro: 0,
        adiantamento: 0,
        outros_descontos: 0,
        status: 'rascunho'
      }));

      const { error } = await supabase
        .from('folha_pagamento')
        .insert(newEntries);

      if (error) throw error;
    }
  },

  // Units
  async getUnits(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('ativa', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  // Allocations
  async getAllocations(payrollEntryId: string): Promise<PayrollAllocation[]> {
    const { data, error } = await supabase
      .from('folha_rateio')
      .select('*')
      .eq('folha_pagamento_id', payrollEntryId);

    if (error) throw error;
    return data || [];
  },

  async updateAllocation(payrollEntryId: string, unitId: string, value: number): Promise<void> {
    // First check if allocation exists
    const { data: existing } = await supabase
      .from('folha_rateio')
      .select('id')
      .eq('folha_pagamento_id', payrollEntryId)
      .eq('unidade_id', unitId)
      .maybeSingle();

    if (existing) {
      // Update existing allocation
      const { error } = await supabase
        .from('folha_rateio')
        .update({ valor: value, percentual: 0 })
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Create new allocation
      const { error } = await supabase
        .from('folha_rateio')
        .insert({
          folha_pagamento_id: payrollEntryId,
          unidade_id: unitId,
          valor: value,
          percentual: 0
        });

      if (error) throw error;
    }
  },

  async autoDistributeAllocation(payrollEntryId: string, unitIds: string[]): Promise<void> {
    const { error } = await supabase.rpc('auto_distribute_allocation', {
      payroll_entry_id: payrollEntryId,
      target_units: unitIds
    });

    if (error) throw error;
  },

  // Export functions
  async exportToExcel(month: number, year: number): Promise<Blob> {
    // This would implement Excel export logic
    // For now, returning a placeholder
    return new Blob(['Excel export not implemented'], { type: 'application/vnd.ms-excel' });
  },

  async exportToPDF(month: number, year: number): Promise<Blob> {
    // This would implement PDF export logic
    // For now, returning a placeholder
    return new Blob(['PDF export not implemented'], { type: 'application/pdf' });
  }
};
