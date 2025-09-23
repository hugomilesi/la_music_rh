
import { supabase } from '@/integrations/supabase/client';
import type { Payroll, PayrollEntry, Unit, PayrollAllocation, PayrollFilters } from '@/types/payroll';

export const payrollService = {
  // Payroll Cycles
  async getPayrolls(): Promise<Payroll[]> {
    try {
      const { data, error } = await supabase
        .from('payrolls')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw error;
    }
  },

  async getPayroll(month: number, year: number): Promise<Payroll | null> {
    try {
      const { data, error } = await supabase
        .from('payrolls')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async createPayroll(month: number, year: number, duplicateFrom?: { month: number; year: number }): Promise<Payroll> {
    try {
      const { data, error } = await supabase
        .from('payrolls')
        .insert({ month, year })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create payroll entries
      if (duplicateFrom) {
        await this.duplicatePayrollEntries(data.id, duplicateFrom);
      } else {
        await this.createPayrollEntries(data.id, month, year);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async updatePayrollStatus(id: string, status: 'draft' | 'approved' | 'paid'): Promise<void> {
    try {
      const { error } = await supabase
        .from('payrolls')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  async deletePayroll(id: string): Promise<void> {
    try {
      // First delete related entries
      const { error: entriesError } = await supabase
        .from('folha_pagamento')
        .delete()
        .eq('payroll_id', id);

      if (entriesError) {
        throw entriesError;
      }

      // Then delete the payroll
      const { error } = await supabase
        .from('payrolls')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  // Payroll Entries
  async getAllPayrollEntries(filters?: PayrollFilters): Promise<PayrollEntry[]> {
    try {
      console.log('🔄 PayrollService: Buscando entradas da folha de pagamento', filters);
      
      // Get ALL payroll entries from folha_pagamento table without month/year filter
      let payrollQuery = supabase
        .from('folha_pagamento')
        .select('*')
        .order('ano', { ascending: false })
        .order('mes', { ascending: false })
        .order('id');

      if (filters?.classification) {
        payrollQuery = payrollQuery.eq('classificacao', filters.classification);
      }

      if (filters?.role) {
        payrollQuery = payrollQuery.ilike('funcao', `%${filters.role}%`);
      }

      if (filters?.name) {
        payrollQuery = payrollQuery.ilike('nome_colaborador', `%${filters.name}%`);
      }

      const { data: payrollData, error: payrollError } = await payrollQuery;
      
      if (payrollError) {
        console.error('❌ PayrollService: Erro ao buscar entradas:', payrollError);
        throw payrollError;
      }

      if (!payrollData || payrollData.length === 0) {
        console.log('⚠️ PayrollService: Nenhuma entrada encontrada');
        return [];
      }

      console.log(`✅ PayrollService: ${payrollData.length} entradas encontradas`);

      // Map data directly from folha_pagamento table
      const mappedData = payrollData.map(entry => ({
        id: entry.id,
        collaborator_id: entry.colaborador_id,
        collaborator_name: entry.nome_colaborador || '',
        month: entry.mes,
        year: entry.ano,
        classification: entry.classificacao || '',
        role: entry.funcao || '',
        base_salary: entry.salario_base || 0,
        bonus: entry.bonus || 0,
        commission: entry.comissao || 0,
        transport: entry.passagem || 0,
        reimbursement: entry.reembolso || 0,
        inss: entry.inss || 0,
        store_discount: entry.lojinha || 0,
        bistro_discount: entry.bistro || 0,
        advance: entry.adiantamento || 0,
        other_discounts: entry.outros_descontos || 0,
        transport_voucher: entry.transport_voucher || 0,
        salary_advance: entry.salary_advance || 0,
        observations: entry.observacoes || '',
      status: entry.status || 'pendente',
      approved_by: entry.aprovado_por,
      approved_at: entry.aprovado_em,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      payroll_id: entry.payroll_id,
      // Use data from folha_pagamento table
      unidade: entry.unidade || '',
      nome_colaborador: entry.nome_colaborador || '',
      cpf_colaborador: entry.cpf_colaborador || '',
      banco: entry.banco || '',
      agencia: entry.agencia || '',
      conta: entry.conta || '',
      pix: entry.pix || '',
      salario_base: entry.salario_base || 0,
      comissao: entry.comissao || 0,
      passagem: entry.passagem || 0,
      reembolso: entry.reembolso || 0,
      lojinha: entry.lojinha || 0,
      bistro: entry.bistro || 0,
      adiantamento: entry.adiantamento || 0,
      outros_descontos: entry.outros_descontos || 0,
      funcao: entry.funcao || '',
      classificacao: entry.classificacao || '',
    }));

    return mappedData;
    } catch (error) {
      throw error;
    }
  },

  async getPayrollEntries(month: number, year: number, filters?: PayrollFilters): Promise<PayrollEntry[]> {
    try {
      // Get payroll entries directly from folha_pagamento table
      let payrollQuery = supabase
        .from('folha_pagamento')
        .select('*')
        .eq('mes', month)
        .eq('ano', year)
        .order('id');

      if (filters?.classification) {
        payrollQuery = payrollQuery.eq('classificacao', filters.classification);
      }

      if (filters?.role) {
        payrollQuery = payrollQuery.ilike('funcao', `%${filters.role}%`);
      }

      if (filters?.name) {
        payrollQuery = payrollQuery.ilike('nome_colaborador', `%${filters.name}%`);
      }

      const { data: payrollData, error: payrollError } = await payrollQuery;
      
      if (payrollError) {
        throw payrollError;
      }

      if (!payrollData || payrollData.length === 0) {
        return [];
      }

      // Map data directly from folha_pagamento table
      const mappedData = payrollData.map(entry => ({
      id: entry.id,
      collaborator_id: entry.colaborador_id,
      collaborator_name: entry.nome_colaborador || '',
      month: entry.mes,
      year: entry.ano,
      classification: entry.classificacao || '',
      role: entry.funcao || '',
      base_salary: entry.salario_base || 0,
      bonus: entry.bonus || 0,
      commission: entry.comissao || 0,
      transport: entry.passagem || 0,
      reimbursement: entry.reembolso || 0,
      inss: entry.inss || 0,
      store_discount: entry.lojinha || 0,
      bistro_discount: entry.bistro || 0,
      advance: entry.adiantamento || 0,
      other_discounts: entry.outros_descontos || 0,
      transport_voucher: entry.transport_voucher || 0,
      salary_advance: entry.salary_advance || 0,
      observations: entry.observacoes || '',
      status: entry.status || 'pendente',
      approved_by: entry.aprovado_por,
      approved_at: entry.aprovado_em,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      payroll_id: entry.payroll_id,
      // Use data from folha_pagamento table
      unidade: entry.unidade || '',
      nome_colaborador: entry.nome_colaborador || '',
      cpf_colaborador: entry.cpf_colaborador || '',
      banco: entry.banco || '',
      agencia: entry.agencia || '',
      conta: entry.conta || '',
      pix: entry.pix || '',
      salario_base: entry.salario_base || 0,
      comissao: entry.comissao || 0,
      passagem: entry.passagem || 0,
      reembolso: entry.reembolso || 0,
      lojinha: entry.lojinha || 0,
      bistro: entry.bistro || 0,
      adiantamento: entry.adiantamento || 0,
      outros_descontos: entry.outros_descontos || 0,
      funcao: entry.funcao || '',
      classificacao: entry.classificacao || '',
      // Create a mock users object for compatibility with existing PayrollPage code
      users: {
        username: entry.nome_colaborador || '',
        cpf: entry.cpf_colaborador || '',
        units: entry.unidade ? [entry.unidade.toLowerCase()] : [],
        unit: entry.unidade || '',
        bank: entry.banco || '',
        agency: entry.agencia || '',
        account: entry.conta || '',
        pix: entry.pix || ''
      }
    }));
    
    return mappedData;
    } catch (error) {
      console.error('❌ PayrollService: Erro ao buscar entradas da folha de pagamento:', error);
      throw error;
    }
  },

  async createPayrollEntry(entry: {
    colaborador_id?: string;
    mes: number;
    ano: number;
    classificacao: string;
    funcao: string;
    salario_base: number;
    bonus?: number;
    comissao?: number;
    passagem?: number;
    reembolso?: number;
    inss?: number;
    lojinha?: number;
    bistro?: number;
    adiantamento?: number;
    outros_descontos?: number;
    observacoes?: string;
    payroll_id?: string;
    nome_colaborador?: string;
    cpf_colaborador?: string;
    unidade?: string;
    banco?: string;
    agencia?: string;
    conta?: string;
    pix?: string;
  }): Promise<PayrollEntry> {
    // Validate required fields
    if (!entry.mes || entry.mes < 1 || entry.mes > 12) {
      throw new Error('Mês deve estar entre 1 e 12');
    }
    if (!entry.ano || entry.ano < 2020) {
      throw new Error('Ano deve ser válido');
    }

    // Validate that either colaborador_id or manual employee data is provided
    if (!entry.colaborador_id && (!entry.nome_colaborador || !entry.cpf_colaborador || !entry.unidade)) {
      throw new Error('É necessário fornecer um colaborador cadastrado ou os dados completos do colaborador (nome, CPF e unidade)');
    }

    // Check if entry already exists for this employee in this month/year
    let existingEntryQuery = supabase
      .from('folha_pagamento')
      .select('id')
      .eq('mes', entry.mes)
      .eq('ano', entry.ano);

    if (entry.colaborador_id) {
      existingEntryQuery = existingEntryQuery.eq('colaborador_id', entry.colaborador_id);
    } else {
      existingEntryQuery = existingEntryQuery.eq('cpf_colaborador', entry.cpf_colaborador);
    }

    const { data: existingEntry, error: checkError } = await existingEntryQuery.maybeSingle();

    if (checkError) throw checkError;

    if (existingEntry) {
      throw new Error('Já existe uma entrada de folha de pagamento para este colaborador no mês/ano especificado');
    }

    const payrollData = {
      colaborador_id: entry.colaborador_id,
      mes: entry.mes,
      ano: entry.ano,
      classificacao: entry.classificacao,
      funcao: entry.funcao,
      salario_base: entry.salario_base,
      bonus: entry.bonus || 0,
      comissao: entry.comissao || 0,
      passagem: entry.passagem || 0,
      reembolso: entry.reembolso || 0,
      inss: entry.inss || 0,
      lojinha: entry.lojinha || 0,
      bistro: entry.bistro || 0,
      adiantamento: entry.adiantamento || 0,
      outros_descontos: entry.outros_descontos || 0,
      observacoes: entry.observacoes || '',
      payroll_id: entry.payroll_id,
      nome_colaborador: entry.nome_colaborador,
      cpf_colaborador: entry.cpf_colaborador,
      unidade: entry.unidade,
      banco: entry.banco,
      agencia: entry.agencia,
      conta: entry.conta,
      pix: entry.pix,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Criar novo registro
    const { data, error } = await supabase
      .from('folha_pagamento')
      .insert(payrollData)
      .select()
      .single();

    if (error) throw error;

    // Return the created entry in the expected format
    return await this.getPayrollEntry(data.id) as PayrollEntry;
  },

  async upsertPayrollEntry(entry: {
    id?: string;
    colaborador_id: string;
    mes: number;
    ano: number;
    classificacao: string;
    funcao: string;
    salario_base: number;
    bonus?: number;
    comissao?: number;
    passagem?: number;
    reembolso?: number;
    inss?: number;
    lojinha?: number;
    bistro?: number;
    adiantamento?: number;
    outros_descontos?: number;
    observacoes?: string;
    payroll_id?: string;
  }): Promise<PayrollEntry> {
    if (entry.id) {
      // Update existing entry
      await this.updatePayrollEntry(entry.id, {
        base_salary: entry.salario_base,
        bonus: entry.bonus,
        commission: entry.comissao,
        transport: entry.passagem,
        reimbursement: entry.reembolso,
        inss: entry.inss,
        store_discount: entry.lojinha,
        bistro_discount: entry.bistro,
        advance: entry.adiantamento,
        other_discounts: entry.outros_descontos,
        notes: entry.observacoes,
        classification: entry.classificacao,
        role: entry.funcao
      });
      return await this.getPayrollEntry(entry.id) as PayrollEntry;
    } else {
      // Create new entry
      return await this.createPayrollEntry(entry);
    }
  },

  async updatePayrollEntry(id: string, updates: Partial<PayrollEntry>): Promise<void> {
    try {
      const updateData: any = {};
      
      // Map frontend fields to database fields
      if (updates.base_salary !== undefined) updateData.salario_base = updates.base_salary;
      if (updates.bonus !== undefined) updateData.bonus = updates.bonus;
      if (updates.commission !== undefined) updateData.comissao = updates.commission;
      if (updates.reimbursement !== undefined) updateData.reembolso = updates.reimbursement;
      
      // Handle transport fields - prioritize transport over transport_voucher
      if (updates.transport !== undefined) {
        updateData.passagem = updates.transport;
      } else if (updates.transport_voucher !== undefined) {
        updateData.transport_voucher = updates.transport_voucher;
      }
      
      if (updates.inss !== undefined) updateData.inss = updates.inss;
      
      // Handle store fields - prioritize store_discount over store_expenses
      if (updates.store_discount !== undefined) {
        updateData.lojinha = updates.store_discount;
      } else if (updates.store_expenses !== undefined) {
        updateData.lojinha = updates.store_expenses;
      }
      
      // Handle bistro fields - prioritize bistro_discount over bistro_expenses
      if (updates.bistro_discount !== undefined) {
        updateData.bistro = updates.bistro_discount;
      } else if (updates.bistro_expenses !== undefined) {
        updateData.bistro = updates.bistro_expenses;
      }
      
      // Handle advance fields - prioritize advance over salary_advance
      if (updates.advance !== undefined) {
        updateData.adiantamento = updates.advance;
      } else if (updates.salary_advance !== undefined) {
        updateData.salary_advance = updates.salary_advance;
      }
      
      if (updates.other_discounts !== undefined) updateData.outros_descontos = updates.other_discounts;
      if (updates.notes !== undefined) updateData.observacoes = updates.notes;
      if (updates.classification !== undefined) updateData.classificacao = updates.classification;
      if (updates.role !== undefined) updateData.funcao = updates.role;
      if (updates.status !== undefined) updateData.status = updates.status;
      
      // Add updated timestamp
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('folha_pagamento')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  async deletePayrollEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('folha_pagamento')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  },

  async getPayrollEntry(id: string): Promise<PayrollEntry | null> {
    try {
      const { data, error } = await supabase
        .from('folha_pagamento')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      if (!data) {
        return null;
      }

      // Get user data separately if colaborador_id exists
      let userData = null;
      if (data.colaborador_id) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('auth_user_id, username, cpf, units, department, bank, agency, account, pix')
          .eq('auth_user_id', data.colaborador_id)
          .maybeSingle();
        
        if (!userError) {
          userData = user;
        }
      }
      
      // Map the data to the expected format
      return {
        id: data.id,
        collaborator_id: data.colaborador_id,
        collaborator_name: userData?.username || data.nome_colaborador || '',
        month: data.mes,
        year: data.ano,
        classification: data.classificacao || '',
        role: data.funcao || '',
        base_salary: data.salario_base || 0,
        bonus: data.bonus || 0,
        commission: data.comissao || 0,
        transport: data.passagem || 0,
        reimbursement: data.reembolso || 0,
        inss: data.inss || 0,
        store_discount: data.lojinha || 0,
        bistro_discount: data.bistro || 0,
        advance: data.adiantamento || 0,
        other_discounts: data.outros_descontos || 0,
        notes: data.observacoes || '',
        status: data.status || 'pendente',
        created_at: data.created_at,
        updated_at: data.updated_at,
        payroll_id: data.payroll_id,
        units: userData?.units ? [userData.units] : [],
        department: userData?.department || '',
        bank: userData?.bank || '',
        agency: userData?.agency || '',
        account: userData?.account || '',
        cpf: userData?.cpf || data.cpf_colaborador || '',
        pix: userData?.pix || ''
      };
    } catch (error) {
      throw error;
    }
  },

  async createPayrollEntries(payrollId: string, month?: number, year?: number): Promise<void> {
    try {
      // Get payroll info if month/year not provided
      let targetMonth = month;
      let targetYear = year;
      
      if (!targetMonth || !targetYear) {
        const { data: payroll, error: payrollError } = await supabase
          .from('payrolls')
          .select('month, year')
          .eq('id', payrollId)
          .single();
        
        if (payrollError) throw payrollError;
        targetMonth = payroll.month;
        targetYear = payroll.year;
      }

      // Get all active users to create payroll entries
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('auth_user_id, position_id, roles!position_id(name)')
        .eq('active', true);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        throw new Error('Nenhum usuário ativo encontrado para criar entradas da folha');
      }

      // Check for existing entries to avoid duplicates
      const { data: existingEntries, error: existingError } = await supabase
        .from('folha_pagamento')
        .select('colaborador_id')
        .eq('mes', targetMonth)
        .eq('ano', targetYear);

      if (existingError) throw existingError;

      const existingUserIds = new Set(existingEntries?.map(entry => entry.colaborador_id) || []);

      // Filter out users who already have entries for this month/year
      const usersToCreate = users.filter(user => !existingUserIds.has(user.auth_user_id));

      if (usersToCreate.length === 0) {
        return;
      }

      // Create payroll entries for each user (dados pessoais vêm da tabela users)
      const entries = usersToCreate.map(user => ({
        payroll_id: payrollId,
        colaborador_id: user.auth_user_id,
        mes: targetMonth,
        ano: targetYear,
        classificacao: user.position || '',
        funcao: user.position || '',
        salario_base: 0,
        bonus: 0,
        comissao: 0,
        passagem: 0,
        reembolso: 0,
        inss: 0,
        lojinha: 0,
        bistro: 0,
        adiantamento: 0,
        outros_descontos: 0,
        observacoes: '',
        status: 'pendente'
      }));

      const { error } = await supabase
        .from('folha_pagamento')
        .insert(entries);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  async duplicatePayrollEntries(newPayrollId: string, duplicateFrom: { month: number; year: number }): Promise<void> {
    try {
      // Get the target payroll info to determine the correct month/year
      const { data: targetPayroll, error: targetError } = await supabase
        .from('payrolls')
        .select('month, year')
        .eq('id', newPayrollId)
        .single();

      if (targetError) throw targetError;

      // Get existing entries from the source month/year
      const { data: sourceEntries, error: sourceError } = await supabase
        .from('folha_pagamento')
        .select(`
          colaborador_id,
          classificacao,
          funcao,
          salario_base,
          bonus,
          comissao,
          passagem,
          reembolso,
          inss,
          lojinha,
          bistro,
          adiantamento,
          outros_descontos,
          observacoes
        `)
        .eq('mes', duplicateFrom.month)
        .eq('ano', duplicateFrom.year);

      if (sourceError) throw sourceError;

      if (!sourceEntries || sourceEntries.length === 0) {
        throw new Error('Nenhuma entrada encontrada para duplicar');
      }

      // Check for existing entries in the target month/year to avoid duplicates
      const { data: existingEntries, error: existingError } = await supabase
        .from('folha_pagamento')
        .select('colaborador_id')
        .eq('mes', targetPayroll.month)
        .eq('ano', targetPayroll.year);

      if (existingError) throw existingError;

      const existingUserIds = new Set(existingEntries?.map(entry => entry.colaborador_id) || []);

      // Filter out entries for users who already have entries in the target month/year
      const entriesToCreate = sourceEntries.filter(entry => !existingUserIds.has(entry.colaborador_id));

      if (entriesToCreate.length === 0) {
        return;
      }

      // Create new entries with the new payroll_id and target month/year
      const newEntries = entriesToCreate.map(entry => ({
        payroll_id: newPayrollId,
        colaborador_id: entry.colaborador_id,
        mes: targetPayroll.month,
        ano: targetPayroll.year,
        classificacao: entry.classificacao,
        funcao: entry.funcao,
        salario_base: entry.salario_base,
        bonus: entry.bonus,
        comissao: entry.comissao,
        passagem: entry.passagem,
        reembolso: entry.reembolso,
        inss: entry.inss,
        lojinha: entry.lojinha,
        bistro: entry.bistro,
        adiantamento: entry.adiantamento,
        outros_descontos: entry.outros_descontos,
        observacoes: entry.observacoes,
        status: 'pendente'
      }));

      const { error } = await supabase
        .from('folha_pagamento')
        .insert(newEntries);

      if (error) throw error;
    } catch (error) {
      throw error;
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
  async exportToExcel(entries: any[], month: number, year: number): Promise<void> {
    try {
      // Criar CSV para download
      const headers = [
        'Nome', 'Cargo', 'Classificação', 'Salário Base', 'Bônus', 'Comissão',
        'Vale Transporte', 'Reembolso', 'INSS', 'Lojinha', 'Bistrô', 
        'Adiantamento', 'Outros Descontos', 'Total'
      ];
      
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.collaborator_name || entry.name,
          entry.role || entry.position,
          entry.classification,
          entry.base_salary || 0,
          entry.bonus || 0,
          entry.commission || 0,
          entry.transport_voucher || 0,
          entry.reimbursement || 0,
          entry.inss || 0,
          entry.store_expenses || 0,
          entry.bistro_expenses || 0,
          entry.salary_advance || 0,
          entry.other_discounts || 0,
          entry.net_total || 0
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `folha_pagamento_${year}_${month}.csv`;
      link.click();
    } catch (error) {
      throw new Error('Erro ao exportar para Excel: ' + error.message);
    }
  },

  async exportToPDF(entries: any[], month: number, year: number): Promise<void> {
    try {
      // Criar HTML simples para impressão
      const html = `
        <html>
          <head>
            <title>Folha de Pagamento - ${month}/${year}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Folha de Pagamento</h1>
              <h2>Mês: ${month}/${year}</h2>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Classificação</th>
                  <th>Salário Base</th>
                  <th>Total Líquido</th>
                </tr>
              </thead>
              <tbody>
                ${entries.map(entry => `
                  <tr>
                    <td>${entry.collaborator_name || entry.name}</td>
                    <td>${entry.role || entry.position}</td>
                    <td>${entry.classification}</td>
                    <td>R$ ${(entry.base_salary || 0).toFixed(2)}</td>
                    <td>R$ ${(entry.net_total || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const blob = new Blob([html], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `folha_pagamento_${year}_${month}.html`;
      link.click();
    } catch (error) {
      throw new Error('Erro ao exportar para PDF: ' + error.message);
    }
  },

  mapPayrollEntry(data: any): PayrollEntry {
    return {
      id: data.id,
      colaborador_id: data.colaborador_id,
      mes: data.mes,
      ano: data.ano,
      classificacao: data.classificacao || '',
      funcao: data.funcao || '',
      salario_base: Number(data.salario_base) || 0,
      bonus: Number(data.bonus) || 0,
      comissao: Number(data.comissao) || 0,
      passagem: Number(data.passagem) || 0,
      reembolso: Number(data.reembolso) || 0,
      inss: Number(data.inss) || 0,
      lojinha: Number(data.lojinha) || 0,
      bistro: Number(data.bistro) || 0,
      adiantamento: Number(data.adiantamento) || 0,
      outros_descontos: Number(data.outros_descontos) || 0,
      observacoes: data.observacoes || '',
      status: data.status || 'rascunho',
      aprovado_por: data.aprovado_por,
      aprovado_em: data.aprovado_em,
      created_at: data.created_at,
      updated_at: data.updated_at,
      payroll_id: data.payroll_id,
      transport_voucher: Number(data.transport_voucher) || 0,
      salary_advance: Number(data.salary_advance) || 0,
      nome_colaborador: data.nome_colaborador,
      cpf_colaborador: data.cpf_colaborador,
      unidade: data.unidade
    };
  },

  // Analytics
  async getEvolutionData(): Promise<any[]> {
    const { data, error } = await supabase
      .from('folha_pagamento')
      .select('mes, ano, salario_base, bonus, comissao');

    if (error) throw error;
    
    // Agrupar por mês/ano e somar os custos
    const groupedData = data?.reduce((acc: any[], item: any) => {
      const key = `${item.ano}-${item.mes}`;
      const existingItem = acc.find(i => `${i.ano}-${i.mes}` === key);
      
      const totalCusto = (item.salario_base || 0) + (item.bonus || 0) + (item.comissao || 0);
      
      if (existingItem) {
        existingItem.total_custos = (parseFloat(existingItem.total_custos) + totalCusto).toString();
      } else {
        acc.push({
          mes: item.mes,
          ano: item.ano,
          total_custos: totalCusto.toString()
        });
      }
      
      return acc;
    }, []) || [];

    // Ordenar por ano e mês (mais recente primeiro) e pegar apenas os últimos 6 meses
    const sortedData = groupedData
      .sort((a, b) => {
        if (a.ano !== b.ano) return b.ano - a.ano;
        return b.mes - a.mes;
      })
      .slice(0, 6);

    return sortedData;
  },

  mapEmployee(data: any): Employee {
    return {
      id: data.id,
      name: data.nome_colaborador || data.users?.username || 'Nome não disponível',
      unit: data.unidade || data.users?.units || 'Unidade não disponível',
      units: data.users?.units ? 1 : 0,
      position: data.funcao || data.users?.position || 'Posição não disponível',
      classification: data.classificacao || 'Classificação não disponível',
      salario_base: Number(data.salario_base) || 0,
      bonus: Number(data.bonus) || 0,
      comissao: Number(data.comissao) || 0,
      passagem: Number(data.passagem) || 0,
      reembolso: Number(data.reembolso) || 0,
      inss: Number(data.inss) || 0,
      lojinha: Number(data.lojinha) || 0,
      bistro: Number(data.bistro) || 0,
      adiantamento: Number(data.adiantamento) || 0,
      outros_descontos: Number(data.outros_descontos) || 0,
      observacoes: data.observacoes || '',
      status: data.status || 'rascunho',
      aprovado_por: data.aprovado_por,
      aprovado_em: data.aprovado_em,
      created_at: data.created_at,
      updated_at: data.updated_at,
      payroll_id: data.payroll_id,
      mes: data.mes,
      ano: data.ano,
      colaborador_id: data.colaborador_id,
      nome_colaborador: data.nome_colaborador,
      cpf_colaborador: data.cpf_colaborador,
      unidade: data.unidade
    };
  }

};
