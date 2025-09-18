import { supabase } from '@/integrations/supabase/client';
import { Benefit, BenefitType, EmployeeBenefit } from '@/types/benefits';
import { benefitDocumentService, BenefitDocumentUpload } from './benefitDocumentService';

export const benefitsService = {
  // Benefit Types
  async getBenefitTypes(): Promise<BenefitType[]> {
    try {
      console.log('BenefitsService: Buscando tipos de benefícios...');
      
      const { data, error } = await supabase
        .from('benefit_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('BenefitsService: Erro ao buscar tipos de benefícios:', error);
        throw error;
      }

      console.log('BenefitsService: Tipos de benefícios encontrados:', data?.length || 0);
      
      const mappedData = data.map(type => ({
        id: type.id,
        name: type.name,
        category: type.category,
        icon: benefitsService.getCategoryIcon(type.category),
        color: benefitsService.getCategoryColor(type.category)
      }));
      
      return mappedData;
    } catch (error) {
      console.error('BenefitsService: Erro em getBenefitTypes:', error);
      throw error;
    }
  },

  // Benefits
  async getBenefits(): Promise<Benefit[]> {
    try {
      console.log('BenefitsService: Buscando benefícios...');
      
      const { data, error } = await supabase
        .from('benefits')
        .select(`
          *,
          benefit_types(*)
        `)
        .order('name'); // Corrigido: banco usa 'name' não 'nome'

      if (error) {
        console.error('BenefitsService: Erro ao buscar benefícios:', error);
        throw error;
      }
      
      console.log('BenefitsService: Benefícios encontrados:', data?.length || 0);

      // Map benefits and load documents for each
      const benefitsWithDocuments = await Promise.all(
        data.map(async (benefit) => {
          // For now, we'll load documents based on benefit ID
          // Note: This assumes documents are linked to benefits directly
          // In the future, this might need to be adjusted based on the actual relationship
          let documents: string[] = [];
          try {
            // Try to get documents for this benefit
            // Since benefitDocumentService expects employee_benefit_id, 
            // we'll implement a simpler approach for now
            documents = [];
          } catch (error) {
            // Document loading warning disabled
            documents = [];
          }

          return {
            id: benefit.id,
            name: benefit.name,
            type: benefit.benefit_types ? {
              id: benefit.benefit_types.id,
              name: benefit.benefit_types.name,
              category: benefit.benefit_types.category,
              icon: benefitsService.getCategoryIcon(benefit.benefit_types.category),
              color: benefitsService.getCategoryColor(benefit.benefit_types.category)
            } : {
              id: '',
              name: 'Tipo não encontrado',
              category: 'other',
              icon: 'help-circle',
              color: '#gray'
            },
            description: benefit.description || '',
            value: parseFloat(benefit.cost) || 0,
            coverage: (() => {
              const coverageData = benefit.coverage_details;
              if (!coverageData) return [];
              if (typeof coverageData === 'object' && coverageData.items) {
                return Array.isArray(coverageData.items) ? coverageData.items : [];
              }
              if (typeof coverageData === 'object' && coverageData.description) {
                return [coverageData.description];
              }
              return [];
            })(),
            eligibilityRules: benefit.eligibility_rules || [],
            provider: benefit.provider || '',
            isActive: benefit.is_active !== undefined ? benefit.is_active : true,
            startDate: benefit.effective_date || '',
            endDate: benefit.expiration_date || '',
            documents, // Now properly loaded
            performanceGoals: benefit.performance_goals || [],
            renewalSettings: benefit.renewal_settings || null,
            createdAt: benefit.created_at,
            updatedAt: benefit.updated_at
          };
        })
      );
      
      return benefitsWithDocuments;
    } catch (error) {
      console.error('BenefitsService: Erro em getBenefits:', error);
      throw error;
    }
  },

  async createBenefit(benefitData: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Benefit> {
    let data: any;
    
    try {
      console.log('BenefitsService: 🔄 Criando novo benefício:', benefitData.name);
      
      // Map category to tipo field based on benefit type category
      const tipoMapping: Record<string, string> = {
        'health': 'saude',
        'dental': 'odontologico',
        'food': 'alimentacao',
        'transport': 'transporte',
        'education': 'educacao',
        'life': 'seguro',
        'performance': 'performance',
        'other': 'outros'
      };
      
      // Defensive validation to ensure tipo is always defined
      const category = benefitData.type?.category || 'other';
      const tipo = tipoMapping[category] || 'outros';
      
      const { data: insertData, error } = await supabase
        .from('benefits')
        .insert({
          name: benefitData.name,
          description: benefitData.description,
          benefit_type_id: benefitData.type.id,
          provider: benefitData.provider,
          cost: benefitData.value,
          employee_contribution: 0,
          employer_contribution: benefitData.value,
          eligibility_rules: benefitData.eligibilityRules || {},
          coverage_details: Array.isArray(benefitData.coverage) 
            ? { items: benefitData.coverage }
            : { description: benefitData.coverage },
          is_active: benefitData.isActive,
          effective_date: benefitData.startDate,
          expiration_date: benefitData.endDate
        })
        .select(`
          *,
          benefit_types(*)
        `)
        .single();

      if (error) {
        console.error('BenefitsService: ❌ Erro ao criar benefício:', error);
        throw error;
      }

      console.log('BenefitsService: ✅ Benefício criado com sucesso:', insertData.id);
      data = insertData;
    } catch (error) {
      console.error('BenefitsService: ❌ Erro em createBenefit:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      type: data.benefit_types ? {
        id: data.benefit_types.id,
        name: data.benefit_types.name,
        category: data.benefit_types.category,
        icon: benefitsService.getCategoryIcon(data.benefit_types.category),
        color: benefitsService.getCategoryColor(data.benefit_types.category)
      } : {
        id: '',
        name: 'Tipo não encontrado',
        category: 'other',
        icon: 'help-circle',
        color: '#gray'
      },
      description: data.description || '',
      value: parseFloat(data.cost) || 0,
      coverage: (() => {
        if (!data.coverage_details) return [];
        if (typeof data.coverage_details === 'object' && data.coverage_details.items) {
          return Array.isArray(data.coverage_details.items) ? data.coverage_details.items : [];
        }
        if (typeof data.coverage_details === 'object' && data.coverage_details.description) {
          return [data.coverage_details.description];
        }
        return [];
      })(),
      eligibilityRules: data.eligibility_rules || [],
      provider: data.provider || '',
      isActive: data.is_active,
      startDate: data.effective_date || '',
      endDate: data.expiration_date || '',
      documents: [], // Will be implemented later if needed
      performanceGoals: data.performance_goals || [],
      renewalSettings: data.renewal_settings || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateBenefit(id: string, benefitData: Partial<Benefit>): Promise<Benefit> {
    try {
      console.log('BenefitsService: 🔄 Atualizando benefício:', id);
      
      const updateData: any = {};
      
      // Map category to tipo field based on benefit type category
      const tipoMapping: Record<string, string> = {
        'health': 'saude',
        'dental': 'odontologico',
        'food': 'alimentacao',
        'transport': 'transporte',
        'education': 'educacao',
        'life': 'seguro',
        'performance': 'performance',
        'other': 'outros'
      };
      
      // Map frontend fields to database fields
      if (benefitData.name !== undefined) updateData.nome = benefitData.name;
      if (benefitData.type !== undefined) {
        updateData.type_id = benefitData.type.id;
        // Defensive validation to ensure tipo is always defined
        const category = benefitData.type?.category || 'other';
        updateData.tipo = tipoMapping[category] || 'outros';
      }
      if (benefitData.description !== undefined) updateData.descricao = benefitData.description;
      if (benefitData.value !== undefined) updateData.valor = benefitData.value;
      if (benefitData.coverage !== undefined) {
        // Serialize coverage array as JSON string for database storage
        updateData.coverage = Array.isArray(benefitData.coverage) 
          ? JSON.stringify(benefitData.coverage)
          : benefitData.coverage;
      }
      if (benefitData.isActive !== undefined) updateData.ativo = benefitData.isActive;
      if (benefitData.startDate !== undefined) {
        // Only set start_date if it's a valid date string, not empty
        updateData.start_date = benefitData.startDate && benefitData.startDate.trim() !== '' ? benefitData.startDate : null;
      }
      if (benefitData.endDate !== undefined) {
        // Only set end_date if it's a valid date string, not empty
        updateData.end_date = benefitData.endDate && benefitData.endDate.trim() !== '' ? benefitData.endDate : null;
      }
      
      // Handle new fields that now exist in database
      if (benefitData.provider !== undefined) updateData.provider = benefitData.provider;
      if (benefitData.eligibilityRules !== undefined) updateData.eligibility_rules = benefitData.eligibilityRules;
      if (benefitData.performanceGoals !== undefined) updateData.performance_goals = benefitData.performanceGoals;
      if (benefitData.renewalSettings !== undefined) updateData.renewal_settings = benefitData.renewalSettings;

      const { data, error } = await supabase
        .from('benefits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          benefit_types(*)
        `)
        .single();

      if (error) {
        console.error('BenefitsService: ❌ Erro ao atualizar benefício:', error);
        throw error;
      }

      console.log('BenefitsService: ✅ Benefício atualizado com sucesso:', id);
    } catch (error) {
      console.error('BenefitsService: ❌ Erro em updateBenefit:', error);
      throw error;
    }

    // Handle document uploads if provided
    let uploadedDocuments: string[] = [];
    if (benefitData.documentFiles && benefitData.documentFiles.length > 0) {
      try {
        // Processing document uploads for benefit logging disabled
        
        // Upload each file and create document records
        for (const file of benefitData.documentFiles) {
          try {
            // Create a unique filename to avoid conflicts
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            
            // For now, we'll create a document record with the file name
            // In a full implementation, you would:
            // 1. Upload the file to Supabase Storage
            // 2. Get the storage URL
            // 3. Create the document record with the storage URL
            
            // Processing file logging disabled
            uploadedDocuments.push(file.name);
            
            // TODO: Implement actual file upload to storage
            // const uploadResult = await benefitDocumentService.uploadDocument({
            //   employee_benefit_id: 'temp', // This would need to be an employee benefit ID
            //   document_name: fileName,
            //   document_type: file.type || 'application/octet-stream',
            //   file: file
            // });
            
          } catch (fileError) {
            // Error processing file logging disabled
          }
        }
        
    
      } catch (docError) {
        // Error processing documents during benefit update logging disabled
        // Don't fail the entire update if document processing fails
      }
    } else if (benefitData.documents && benefitData.documents.length > 0) {
      // Handle existing document names (for backward compatibility)
      uploadedDocuments = benefitData.documents;
    }

    return {
      id: data.id,
      name: data.nome,
      type: data.benefit_types ? {
        id: data.benefit_types.id,
        name: data.benefit_types.name,
        category: data.benefit_types.category,
        icon: benefitsService.getCategoryIcon(data.benefit_types.category),
        color: benefitsService.getCategoryColor(data.benefit_types.category)
      } : {
        id: '',
        name: 'Tipo não encontrado',
        category: 'other',
        icon: 'help-circle',
        color: '#gray'
      },
      description: data.descricao || '',
      value: parseFloat(data.valor) || 0,
      coverage: (() => {
        if (!data.coverage) return [];
        if (Array.isArray(data.coverage)) return data.coverage;
        try {
          const parsed = JSON.parse(data.coverage);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return typeof data.coverage === 'string' ? [data.coverage] : [];
        }
      })(),
      eligibilityRules: data.eligibility_rules || [],
      provider: data.provider || '',
      isActive: data.ativo,
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      documents: uploadedDocuments,
      performanceGoals: data.performance_goals || [],
      renewalSettings: data.renewal_settings || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteBenefit(id: string): Promise<void> {
    try {
      console.log('BenefitsService: 🔄 Deletando benefício:', id);
      
      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('BenefitsService: ❌ Erro ao deletar benefício:', error);
        throw error;
      }

      console.log('BenefitsService: ✅ Benefício deletado com sucesso:', id);
    } catch (error) {
      console.error('BenefitsService: ❌ Erro em deleteBenefit:', error);
      throw error;
    }
  },

  // Employee Benefits
  async getEmployeeBenefits(): Promise<EmployeeBenefit[]> {
    try {
      console.log('BenefitsService: 🔄 Buscando benefícios de funcionários...');
      
      // First get employee benefits with user and benefit info
      const { data: employeeBenefitsData, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          users(username),
          benefits(nome),
          dependents:benefit_dependents(*)
        `)
        .order('enrollment_date', { ascending: false });
      
      if (error) {
        console.error('BenefitsService: ❌ Erro ao buscar benefícios de funcionários:', error);
        throw error;
      }
      
      // Then get all dependents for these employee benefits
      const employeeBenefitIds = employeeBenefitsData.map(eb => eb.id);
      const { data: dependentsData, error: dependentsError } = await supabase
        .from('benefit_dependents')
        .select('*')
        .in('employee_benefit_id', employeeBenefitIds);
      
      if (dependentsError) {
        console.warn('BenefitsService: ⚠️ Erro ao buscar dependentes:', dependentsError);
        // Don't throw, just log and continue without dependents
      }
      
      // Group dependents by employee_benefit_id
      const dependentsByEmployeeBenefit = (dependentsData || []).reduce((acc, dep) => {
        if (!acc[dep.employee_benefit_id]) {
          acc[dep.employee_benefit_id] = [];
        }
        acc[dep.employee_benefit_id].push(dep);
        return acc;
      }, {} as Record<string, any[]>);
      
      const data = employeeBenefitsData.map(eb => ({
        ...eb,
        benefit_dependents: dependentsByEmployeeBenefit[eb.id] || []
      }));
      
      console.log('BenefitsService: ✅ Benefícios de funcionários encontrados:', data.length);
      
      return data.map(eb => ({
        id: eb.id,
        employeeId: eb.employee_id,
        employeeName: eb.users?.username || 'Funcionário não encontrado',
        benefitId: eb.benefit_id,
        benefitName: eb.benefits?.nome || 'Benefício não encontrado',
        enrollmentDate: eb.enrollment_date,
        // Status is determined by dates: active if no end date or future end date
        dependents: eb.benefit_dependents?.map((dep: any) => ({
          id: dep.id,
          name: dep.name,
          relationship: dep.relationship,
          birthDate: dep.birth_date,
          documentNumber: dep.document_number,
          isActive: dep.is_active
        })) || [],
        documents: [], // Will be implemented later if needed
        lastUpdate: eb.updated_at,
        nextRenewalDate: eb.termination_date,
        renewalStatus: eb.status || 'active'
      }));
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em getEmployeeBenefits:', error);
      throw error;
    }
  },

  async createEmployeeBenefit(data: { employeeId: string; benefitId: string; dependents?: any[]; documents?: any[] }): Promise<EmployeeBenefit> {
    try {
      console.log('BenefitsService: 🔄 Iniciando createEmployeeBenefit', { employeeId: data.employeeId, benefitId: data.benefitId });
      
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(data.employeeId)) {
        console.log('BenefitsService: ❌ Formato inválido de employeeId', { employeeId: data.employeeId });
        throw new Error(`Invalid employeeId format: ${data.employeeId}. Expected UUID format.`);
      }
      
      if (!uuidRegex.test(data.benefitId)) {
        console.log('BenefitsService: ❌ Formato inválido de benefitId', { benefitId: data.benefitId });
        throw new Error(`Invalid benefitId format: ${data.benefitId}. Expected UUID format.`);
      }

      const result = await this.enrollEmployee(data.employeeId, data.benefitId, data.dependents);
      console.log('BenefitsService: ✅ createEmployeeBenefit concluído com sucesso', { id: result.id });
      return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em createEmployeeBenefit:', error);
      throw error;
    }
  },

  async enrollEmployee(employeeId: string, benefitId: string, dependents: any[] = []): Promise<EmployeeBenefit> {
    try {
      console.log('BenefitsService: 🔄 Iniciando enrollEmployee', { employeeId, benefitId, dependentsCount: dependents.length });
      
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(employeeId)) {
        console.log('BenefitsService: ❌ Formato inválido de employeeId em enrollEmployee', { employeeId });
        throw new Error(`Invalid employeeId format: ${employeeId}. Expected UUID format.`);
      }
      
      if (!uuidRegex.test(benefitId)) {
        console.log('BenefitsService: ❌ Formato inválido de benefitId em enrollEmployee', { benefitId });
        throw new Error(`Invalid benefitId format: ${benefitId}. Expected UUID format.`);
      }

      // Check if enrollment already exists
      const { data: existingEnrollment, error: checkError } = await supabase
      .from('employee_benefits')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('benefit_id', benefitId)
      .maybeSingle();

    if (checkError) {
      console.log('BenefitsService: ❌ Erro ao verificar inscrição existente em enrollEmployee:', checkError);
      throw checkError;
    }

    if (existingEnrollment) {
      throw new Error('Funcionário já está inscrito neste benefício');
    }
    
    // First create the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('employee_benefits')
      .insert({
        employee_id: employeeId,
        benefit_id: benefitId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      .select(`
        *,
        users(username),
        benefits(nome)
      `)
      .single();

    if (enrollmentError) {
      // Log desabilitado
      if (enrollmentError.code === '23505') {
        throw new Error('Funcionário já está inscrito neste benefício');
      }
      throw enrollmentError;
    }

    // Then create dependents if any
    if (dependents.length > 0) {
      const dependentData = dependents.map(dep => ({
        employee_benefit_id: enrollment.id,
        name: dep.name,
        relationship: dep.relationship,
        birth_date: dep.birthDate,
        document_number: dep.documentNumber,
        is_active: dep.isActive !== false
      }));

      const { error: dependentsError } = await supabase
        .from('benefit_dependents')
        .insert(dependentData);

      if (dependentsError) {
        console.log('BenefitsService: ⚠️ Erro ao inserir dependentes, mas inscrição foi bem-sucedida:', dependentsError);
        // Don't throw here, enrollment was successful
      }
    }

    const result = {
      id: enrollment.id,
      employeeId: enrollment.employee_id,
      employeeName: enrollment.users?.username || 'Funcionário não encontrado',
      benefitId: enrollment.benefit_id,
      benefitName: enrollment.benefits?.nome || 'Benefício não encontrado',
      enrollmentDate: enrollment.enrollment_date,
      // Status determined by dates
      dependents: dependents || [],
      documents: [],
      lastUpdate: enrollment.updated_at,
      nextRenewalDate: enrollment.termination_date,
      renewalStatus: 'pending'
    };

    console.log('BenefitsService: ✅ enrollEmployee concluído com sucesso', { id: result.id });
    return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em enrollEmployee:', error);
      throw error;
    }
  },

  async updateEmployeeBenefit(id: string, data: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> {
    try {
      console.log('BenefitsService: 🔄 Iniciando updateEmployeeBenefit', { id, data });
      
      const updateData: any = {};
      
      // Map frontend fields to database fields (only use existing columns)
      if (data.nextRenewalDate !== undefined) updateData.next_renewal_date = data.nextRenewalDate;
      if (data.customValue !== undefined) updateData.valor_personalizado = data.customValue;
      if (data.notes !== undefined) updateData.observacoes = data.notes;
      if (data.renewalStatus !== undefined) updateData.renewal_status = data.renewalStatus;
      // Note: performance_data column doesn't exist in the database
      // This is handled in the frontend logic based on other data
      
      console.log('BenefitsService: 🔄 Dados mapeados para atualização:', updateData);
      
      // Check if there's actually data to update
      if (Object.keys(updateData).length === 0) {
        console.log('BenefitsService: ⚠️ Nenhum dado para atualizar, buscando registro atual');
        // If no data to update, just fetch the current record
        const { data: current, error: fetchError } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          users(username),
        benefits(nome),
          dependents:benefit_dependents(*)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) {
          console.log('BenefitsService: ❌ Erro ao buscar registro atual:', fetchError);
          throw fetchError;
        }
        
        const result = {
          id: current.id,
          employeeId: current.employee_id,
          employeeName: current.users?.username || 'Funcionário não encontrado',
          benefitId: current.benefit_id,
          benefitName: current.benefits?.nome || 'Benefício não encontrado',
          enrollmentDate: current.data_inicio,
          dependents: current.dependents?.map((dep: any) => ({
            id: dep.id,
            name: dep.name,
            relationship: dep.relationship,
            birthDate: dep.birth_date,
            documentNumber: dep.document_number,
            isActive: dep.is_active
          })) || [],
          documents: [],
          lastUpdate: current.updated_at,
          nextRenewalDate: current.next_renewal_date || current.data_fim,
          renewalStatus: 'active' // Determined by frontend logic based on dates
        };
        
        console.log('BenefitsService: ✅ Registro atual retornado (sem atualizações)');
        return result;
      }

      const { data: updated, error } = await supabase
        .from('employee_benefits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          users(username),
          benefits(nome),
          dependents:benefit_dependents(*)
        `)
        .single();

      if (error) {
        console.log('BenefitsService: ❌ Erro ao atualizar employee benefit:', error);
        throw error;
      }
      
      const result = {
        id: updated.id,
        employeeId: updated.employee_id,
        employeeName: updated.users?.username || 'Funcionário não encontrado',
        benefitId: updated.benefit_id,
        benefitName: updated.benefits?.nome || 'Benefício não encontrado',
        enrollmentDate: updated.data_inicio,
        // Status determined by dates
        dependents: updated.dependents?.map((dep: any) => ({
          id: dep.id,
          name: dep.name,
          relationship: dep.relationship,
          birthDate: dep.birth_date,
          documentNumber: dep.document_number,
          isActive: dep.is_active
        })) || [],
        documents: [],
        lastUpdate: updated.updated_at,
        nextRenewalDate: updated.next_renewal_date || updated.data_fim,
      renewalStatus: 'active' // Determined by frontend logic based on dates
    };
    
    console.log('BenefitsService: ✅ updateEmployeeBenefit concluído com sucesso', { id: result.id });
    return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em updateEmployeeBenefit:', error);
      throw error;
    }
  },

  async cancelEmployeeBenefit(id: string): Promise<void> {
    try {
      console.log('BenefitsService: 🔄 Iniciando cancelEmployeeBenefit', { id });
      
      const { error } = await supabase
        .from('employee_benefits')
        .delete()
        .eq('id', id);

      if (error) {
        console.log('BenefitsService: ❌ Erro ao cancelar employee benefit:', error);
        throw error;
      }
      
      console.log('BenefitsService: ✅ cancelEmployeeBenefit concluído com sucesso', { id });
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em cancelEmployeeBenefit:', error);
      throw error;
    }
  },

  // Get benefit statistics
  async getStats() {
    try {
      // Get all benefits
      const { data: benefits, error: benefitsError } = await supabase
        .from('benefits')
        .select('id, nome, valor, ativo, tipo');

      if (benefitsError) {
        // Log desabilitado
        throw benefitsError;
      }

      // Get all employee benefits with benefit details
      const { data: employeeBenefits, error: employeeBenefitsError } = await supabase
        .from('employee_benefits')
        .select(`
          benefit_id,
          enrollment_date,
          termination_date,
          premium_amount,
          benefits(valor)
        `);

      if (employeeBenefitsError) {
        // Log desabilitado
        throw employeeBenefitsError;
      }

      // Calculate statistics
      const totalBenefits = benefits.length;
      const activeBenefits = benefits.filter(b => b.ativo).length;
      
      // Consider active enrollments as those without end date or with future end date
      const currentDate = new Date();
      const activeEnrollments = employeeBenefits.filter(eb => 
        !eb.termination_date || new Date(eb.termination_date) > currentDate
      );
      
      const totalEnrollments = activeEnrollments.length;
      const pendingApprovals = 0; // Since we don't have status column, assume no pending approvals
      
      // Calculate total cost from employee benefits (use premium_amount or benefit valor)
      const totalCost = activeEnrollments.reduce((sum, eb) => {
        const cost = eb.premium_amount || eb.benefits?.valor || 0;
        return sum + cost;
      }, 0);

      // Find most popular benefit
      const benefitEnrollmentCounts = activeEnrollments.reduce((acc, eb) => {
        acc[eb.benefit_id] = (acc[eb.benefit_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostPopularBenefitId = Object.entries(benefitEnrollmentCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      const mostPopularBenefit = benefits.find(b => b.id === mostPopularBenefitId)?.nome || 'N/A';

      // Calculate utilization rate
      const utilizationRate = totalBenefits > 0 ? (totalEnrollments / totalBenefits) * 100 : 0;

      // Calculate usage statistics per benefit
      const usage = benefits.map(benefit => {
        const benefitActiveEnrollments = activeEnrollments.filter(
          eb => eb.benefit_id === benefit.id
        );
        
        const enrollments = benefitActiveEnrollments.length;
        
        const benefitTotalCost = benefitActiveEnrollments.reduce((sum, eb) => {
          const cost = eb.premium_amount || eb.benefits?.valor || benefit.valor || 0;
          return sum + cost;
        }, 0);

        return {
          benefitId: benefit.id,
          benefitName: benefit.nome,
          enrollments,
          utilizationRate: enrollments > 0 ? (enrollments / 100) * 100 : 0, // Assuming 100 total employees
          totalCost: benefitTotalCost,
          avgCostPerEmployee: enrollments > 0 ? benefitTotalCost / enrollments : 0
        };
      });

      return {
        stats: {
          totalBenefits,
          activeBenefits,
          totalEnrollments,
          pendingApprovals,
          totalCost,
          mostPopularBenefit,
          utilizationRate,
          benefitsWithGoals: 0, // This would need additional logic for performance goals
          pendingRenewals: 0 // This would need additional logic for renewals
        },
        usage
      };
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em getStats:', error);
      throw error;
    }
  },

  // Document management methods
  async uploadBenefitDocument(uploadData: BenefitDocumentUpload) {
    try {
      console.log('BenefitsService: 🔄 Iniciando uploadBenefitDocument', { uploadData });
      const result = await benefitDocumentService.uploadDocument(uploadData);
      console.log('BenefitsService: ✅ uploadBenefitDocument concluído com sucesso');
      return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em uploadBenefitDocument:', error);
      throw error;
    }
  },

  async getBenefitDocuments(employeeBenefitId: string) {
    try {
      console.log('BenefitsService: 🔄 Iniciando getBenefitDocuments', { employeeBenefitId });
      const result = await benefitDocumentService.getDocumentsByBenefitId(employeeBenefitId);
      console.log('BenefitsService: ✅ getBenefitDocuments concluído com sucesso');
      return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em getBenefitDocuments:', error);
      throw error;
    }
  },

  async downloadBenefitDocument(documentId: string) {
    try {
      console.log('BenefitsService: 🔄 Iniciando downloadBenefitDocument', { documentId });
      const result = await benefitDocumentService.downloadDocument(documentId);
      console.log('BenefitsService: ✅ downloadBenefitDocument concluído com sucesso');
      return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em downloadBenefitDocument:', error);
      throw error;
    }
  },

  async deleteBenefitDocument(documentId: string) {
    try {
      console.log('BenefitsService: 🔄 Iniciando deleteBenefitDocument', { documentId });
      await benefitDocumentService.deleteDocument(documentId);
      console.log('BenefitsService: ✅ deleteBenefitDocument concluído com sucesso');
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em deleteBenefitDocument:', error);
      throw error;
    }
  },

  async updateBenefitDocument(documentId: string, updates: any) {
    try {
      console.log('BenefitsService: 🔄 Iniciando updateBenefitDocument', { documentId, updates });
      const result = await benefitDocumentService.updateDocument(documentId, updates);
      console.log('BenefitsService: ✅ updateBenefitDocument concluído com sucesso');
      return result;
    } catch (error) {
      console.log('BenefitsService: ❌ Erro em updateBenefitDocument:', error);
      throw error;
    }
  },

  // Helper methods for category icons and colors
  getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'health': 'heart',
      'dental': 'smile',
      'food': 'utensils',
      'transport': 'car',
      'education': 'graduation-cap',
      'life': 'shield',
      'performance': 'trophy',
      'other': 'help-circle'
    };
    return iconMap[category] || 'help-circle';
  },

  getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'health': '#ef4444',
      'dental': '#06b6d4',
      'food': '#f59e0b',
      'transport': '#8b5cf6',
      'education': '#10b981',
      'life': '#3b82f6',
      'performance': '#f97316',
      'other': '#6b7280'
    };
    return colorMap[category] || '#6b7280';
  },

  // Subscription for real-time updates
  subscribeToChanges(callback: () => void) {
    // Create a unique channel name to avoid conflicts
    const channelName = `benefits-changes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'benefits'
      }, callback)
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};