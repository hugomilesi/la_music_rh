import { supabase } from '@/integrations/supabase/client';
import { Benefit, BenefitType, EmployeeBenefit } from '@/types/benefits';
import { benefitDocumentService, BenefitDocumentUpload } from './benefitDocumentService';

export const benefitsService = {
  // Benefit Types
  async getBenefitTypes(): Promise<BenefitType[]> {
    console.log('🔍 getBenefitTypes: Starting to fetch benefit types...');
    
    const { data, error } = await supabase
      .from('benefit_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ getBenefitTypes: Error fetching benefit types:', error);
      throw error;
    }

    console.log('✅ getBenefitTypes: Raw data from Supabase:', data);
    
    const mappedData = data.map(type => ({
      id: type.id,
      name: type.name,
      category: type.category,
      icon: type.icon,
      color: type.color
    }));
    
    console.log('✅ getBenefitTypes: Mapped benefit types:', mappedData);
    return mappedData;
  },

  // Benefits
  async getBenefits(): Promise<Benefit[]> {
    const { data, error } = await supabase
      .from('benefits')
      .select(`
        *,
        type:benefit_types!benefits_type_id_fkey(*)
      `)
      .order('nome');

    if (error) {
      console.error('Error fetching benefits:', error);
      throw error;
    }

    return data.map(benefit => {
      return {
        id: benefit.id,
        name: benefit.nome,
        type: benefit.type ? {
          id: benefit.type.id,
          name: benefit.type.name,
          category: benefit.type.category,
          icon: benefit.type.icon,
          color: benefit.type.color
        } : {
          id: '',
          name: 'Tipo não encontrado',
          category: 'other',
          icon: 'help-circle',
          color: '#gray'
        },
        description: benefit.descricao || '',
        value: parseFloat(benefit.valor) || 0,
        coverage: (() => {
          if (!benefit.coverage) return [];
          if (Array.isArray(benefit.coverage)) return benefit.coverage;
          try {
            const parsed = JSON.parse(benefit.coverage);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return typeof benefit.coverage === 'string' ? [benefit.coverage] : [];
          }
        })(),
        eligibilityRules: benefit.eligibility_rules || [],
        provider: benefit.provider || '',
        isActive: benefit.ativo,
        startDate: benefit.start_date || '',
        endDate: benefit.end_date || '',
        documents: [], // Will be implemented later if needed
        performanceGoals: benefit.performance_goals || [],
        renewalSettings: benefit.renewal_settings || null,
        createdAt: benefit.created_at,
        updatedAt: benefit.updated_at
      };
    });
  },

  async createBenefit(benefitData: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Benefit> {
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
    
    const { data, error } = await supabase
      .from('benefits')
      .insert({
        nome: benefitData.name,
        tipo: tipo, // Map category to tipo field
        type_id: benefitData.type.id,
        descricao: benefitData.description,
        valor: benefitData.value,
        coverage: Array.isArray(benefitData.coverage) 
          ? JSON.stringify(benefitData.coverage)
          : benefitData.coverage,
        provider: benefitData.provider,
        ativo: benefitData.isActive,
        start_date: benefitData.startDate,
        end_date: benefitData.endDate
      })
      .select(`
        *,
        type:benefit_types!benefits_type_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Error creating benefit:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nome,
      type: data.type ? {
        id: data.type.id,
        name: data.type.name,
        category: data.type.category,
        icon: data.type.icon,
        color: data.type.color
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
      documents: [], // Will be implemented later if needed
      performanceGoals: data.performance_goals || [],
      renewalSettings: data.renewal_settings || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updateBenefit(id: string, benefitData: Partial<Benefit>): Promise<Benefit> {
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
        type:benefit_types!benefits_type_id_fkey(*)
      `)
      .single();

    if (error) {
      console.error('Error updating benefit:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.nome,
      type: data.type ? {
        id: data.type.id,
        name: data.type.name,
        category: data.type.category,
        icon: data.type.icon,
        color: data.type.color
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
      documents: [], // Will be implemented later if needed
      performanceGoals: data.performance_goals || [],
      renewalSettings: data.renewal_settings || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteBenefit(id: string): Promise<void> {
    const { error } = await supabase
      .from('benefits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting benefit:', error);
      throw error;
    }
  },

  // Employee Benefits
  async getEmployeeBenefits(): Promise<EmployeeBenefit[]> {
    console.log('🔍 getEmployeeBenefits called - fetching employee benefits data');
    
    try {
      const { data, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          employee:employees!employee_benefits_employee_id_fkey(name),
          benefit:benefits!employee_benefits_benefit_id_fkey(nome),
          dependents:benefit_dependents(*)
        `)
        .order('data_inicio', { ascending: false });
      
      if (error) {
        console.error('🚨 Error in getEmployeeBenefits query:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ getEmployeeBenefits query successful, processing data...');
       console.log('Raw data received:', data);
       
       return data.map(eb => ({
      id: eb.id,
      employeeId: eb.employee_id,
      employeeName: eb.employee?.name || 'Funcionário não encontrado',
      benefitId: eb.benefit_id,
      benefitName: eb.benefit?.nome || 'Benefício não encontrado',
      enrollmentDate: eb.data_inicio,
      // Status is determined by dates: active if no end date or future end date
      dependents: eb.dependents?.map((dep: any) => ({
        id: dep.id,
        name: dep.name,
        relationship: dep.relationship,
        birthDate: dep.birth_date,
        documentNumber: dep.document_number,
        isActive: dep.is_active
      })) || [],
      documents: [], // Will be implemented later if needed
      lastUpdate: eb.updated_at,
      nextRenewalDate: eb.next_renewal_date || eb.data_fim,
      renewalStatus: eb.renewal_status || 'pending'
    }));
    } catch (error) {
      console.error('🚨 Unexpected error in getEmployeeBenefits:', error);
      throw error;
    }
  },

  async createEmployeeBenefit(data: { employeeId: string; benefitId: string; dependents?: any[]; documents?: any[] }): Promise<EmployeeBenefit> {
    // Enhanced logging to track the source of invalid IDs
    console.log('🔍 createEmployeeBenefit called with:', {
      employeeId: data.employeeId,
      benefitId: data.benefitId,
      dependents: data.dependents,
      employeeIdType: typeof data.employeeId,
      benefitIdType: typeof data.benefitId,
      stackTrace: new Error().stack
    });
    
    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(data.employeeId)) {
      console.error('🚨 Invalid employeeId UUID in createEmployeeBenefit!');
      console.error('Value:', data.employeeId);
      console.error('Type:', typeof data.employeeId);
      console.error('Stack trace:', new Error().stack);
      throw new Error(`Invalid employeeId format: ${data.employeeId}. Expected UUID format.`);
    }
    
    if (!uuidRegex.test(data.benefitId)) {
      console.error('🚨 Invalid benefitId UUID in createEmployeeBenefit!');
      console.error('Value:', data.benefitId);
      console.error('Type:', typeof data.benefitId);
      console.error('Stack trace:', new Error().stack);
      throw new Error(`Invalid benefitId format: ${data.benefitId}. Expected UUID format.`);
    }
    
    console.log('✅ UUID validation passed in createEmployeeBenefit. Proceeding:', { employeeId: data.employeeId, benefitId: data.benefitId, dependents: data.dependents });
    
    return this.enrollEmployee(data.employeeId, data.benefitId, data.dependents);
  },

  async enrollEmployee(employeeId: string, benefitId: string, dependents: any[] = []): Promise<EmployeeBenefit> {
    // Enhanced logging to track the source of invalid IDs
    console.log('🔍 enrollEmployee called with:', {
      employeeId,
      benefitId,
      dependents,
      employeeIdType: typeof employeeId,
      benefitIdType: typeof benefitId,
      stackTrace: new Error().stack
    });
    
    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(employeeId)) {
      console.error('🚨 Invalid employeeId UUID detected!');
      console.error('Value:', employeeId);
      console.error('Type:', typeof employeeId);
      console.error('Stack trace:', new Error().stack);
      throw new Error(`Invalid employeeId format: ${employeeId}. Expected UUID format.`);
    }
    
    if (!uuidRegex.test(benefitId)) {
      console.error('🚨 Invalid benefitId UUID detected!');
      console.error('Value:', benefitId);
      console.error('Type:', typeof benefitId);
      console.error('Stack trace:', new Error().stack);
      throw new Error(`Invalid benefitId format: ${benefitId}. Expected UUID format.`);
    }

    console.log('✅ UUID validation passed. Proceeding with enrollment:', { employeeId, benefitId, dependents });
    
    // Check if enrollment already exists
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('employee_benefits')
      .select('id')
      .eq('employee_id', employeeId)
      .eq('benefit_id', benefitId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing enrollment:', checkError);
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
        data_inicio: new Date().toISOString().split('T')[0]
      })
      .select(`
        *,
        employee:employees!employee_benefits_employee_id_fkey(name),
        benefit:benefits!employee_benefits_benefit_id_fkey(nome)
      `)
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
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
        console.error('Error creating dependents:', dependentsError);
        // Don't throw here, enrollment was successful
      }
    }

    return {
      id: enrollment.id,
      employeeId: enrollment.employee_id,
      employeeName: enrollment.employee?.name || 'Funcionário não encontrado',
      benefitId: enrollment.benefit_id,
      benefitName: enrollment.benefit?.nome || 'Benefício não encontrado',
      enrollmentDate: enrollment.data_inicio,
      // Status determined by dates
      dependents: dependents || [],
      documents: [],
      lastUpdate: enrollment.updated_at,
      nextRenewalDate: enrollment.next_renewal_date || enrollment.data_fim,
      renewalStatus: 'pending'
    };
  },

  async updateEmployeeBenefit(id: string, data: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> {
    console.log('🔄 Updating employee benefit:', { id, data });
    
    const updateData: any = {};
    
    // Map frontend fields to database fields (only use existing columns)
    if (data.nextRenewalDate !== undefined) updateData.next_renewal_date = data.nextRenewalDate;
    if (data.customValue !== undefined) updateData.valor_personalizado = data.customValue;
    if (data.notes !== undefined) updateData.observacoes = data.notes;
    if (data.renewalStatus !== undefined) updateData.renewal_status = data.renewalStatus;
    // Note: performance_data column doesn't exist in the database
    // This is handled in the frontend logic based on other data
    
    console.log('📝 Update data prepared:', updateData);
    
    // Check if there's actually data to update
    if (Object.keys(updateData).length === 0) {
      console.log('⚠️ No data to update, fetching current record');
      // If no data to update, just fetch the current record
      const { data: current, error: fetchError } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          employee:employees!employee_benefits_employee_id_fkey(name),
          benefit:benefits!employee_benefits_benefit_id_fkey(nome),
          dependents:benefit_dependents(*)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching employee benefit:', fetchError);
        throw fetchError;
      }
      
      return {
        id: current.id,
        employeeId: current.employee_id,
        employeeName: current.employee?.name || 'Funcionário não encontrado',
        benefitId: current.benefit_id,
        benefitName: current.benefit?.nome || 'Benefício não encontrado',
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
    }

    const { data: updated, error } = await supabase
      .from('employee_benefits')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        employee:employees!employee_benefits_employee_id_fkey(name),
        benefit:benefits!employee_benefits_benefit_id_fkey(nome),
        dependents:benefit_dependents(*)
      `)
      .single();

    if (error) {
      console.error('Error updating employee benefit:', error);
      console.error('Update data was:', updateData);
      console.error('ID was:', id);
      throw error;
    }
    
    console.log('✅ Employee benefit updated successfully:', updated);

    return {
      id: updated.id,
      employeeId: updated.employee_id,
      employeeName: updated.employee?.name || 'Funcionário não encontrado',
      benefitId: updated.benefit_id,
      benefitName: updated.benefit?.nome || 'Benefício não encontrado',
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
  },

  async cancelEmployeeBenefit(id: string): Promise<void> {
    const { error } = await supabase
      .from('employee_benefits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error cancelling employee benefit:', error);
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
        console.error('Error fetching benefits for stats:', benefitsError);
        throw benefitsError;
      }

      // Get all employee benefits with benefit details
      const { data: employeeBenefits, error: employeeBenefitsError } = await supabase
        .from('employee_benefits')
        .select(`
          benefit_id,
          data_inicio,
          data_fim,
          valor_personalizado,
          benefit:benefits!employee_benefits_benefit_id_fkey(valor)
        `);

      if (employeeBenefitsError) {
        console.error('Error fetching employee benefits for stats:', employeeBenefitsError);
        throw employeeBenefitsError;
      }

      // Calculate statistics
      const totalBenefits = benefits.length;
      const activeBenefits = benefits.filter(b => b.ativo).length;
      
      // Consider active enrollments as those without end date or with future end date
      const currentDate = new Date();
      const activeEnrollments = employeeBenefits.filter(eb => 
        !eb.data_fim || new Date(eb.data_fim) > currentDate
      );
      
      const totalEnrollments = activeEnrollments.length;
      const pendingApprovals = 0; // Since we don't have status column, assume no pending approvals
      
      // Calculate total cost from employee benefits (use valor_personalizado or benefit valor)
      const totalCost = activeEnrollments.reduce((sum, eb) => {
        const cost = eb.valor_personalizado || eb.benefit?.valor || 0;
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
          const cost = eb.valor_personalizado || eb.benefit?.valor || benefit.valor || 0;
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
      console.error('Error calculating benefit statistics:', error);
      throw error;
    }
  },

  // Document management methods
  async uploadBenefitDocument(uploadData: BenefitDocumentUpload) {
    try {
      console.log('🔄 Uploading benefit document:', uploadData.document_name);
      return await benefitDocumentService.uploadDocument(uploadData);
    } catch (error) {
      console.error('❌ Error uploading benefit document:', error);
      throw error;
    }
  },

  async getBenefitDocuments(employeeBenefitId: string) {
    try {
      return await benefitDocumentService.getDocumentsByBenefitId(employeeBenefitId);
    } catch (error) {
      console.error('❌ Error fetching benefit documents:', error);
      throw error;
    }
  },

  async downloadBenefitDocument(documentId: string) {
    try {
      return await benefitDocumentService.downloadDocument(documentId);
    } catch (error) {
      console.error('❌ Error downloading benefit document:', error);
      throw error;
    }
  },

  async deleteBenefitDocument(documentId: string) {
    try {
      await benefitDocumentService.deleteDocument(documentId);
      console.log('✅ Benefit document deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting benefit document:', error);
      throw error;
    }
  },

  async updateBenefitDocument(documentId: string, updates: any) {
    try {
      return await benefitDocumentService.updateDocument(documentId, updates);
    } catch (error) {
      console.error('❌ Error updating benefit document:', error);
      throw error;
    }
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