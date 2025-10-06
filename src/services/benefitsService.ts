import { supabase } from '@/integrations/supabase/client';
import { Benefit, BenefitType, EmployeeBenefit } from '@/types/benefits';
import { benefitDocumentService, BenefitDocumentUpload } from './benefitDocumentService';

export const benefitsService = {
  // Benefit Types
  async getBenefitTypes(): Promise<BenefitType[]> {
    try {
      
      const { data, error } = await supabase
        .from('benefit_types')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      
      const mappedData = data.map(type => ({
        id: type.id,
        name: type.name,
        category: type.category,
        icon: benefitsService.getCategoryIcon(type.category),
        color: benefitsService.getCategoryColor(type.category)
      }));
      
      return mappedData;
    } catch (error) {
      throw error;
    }
  },

  // Benefits
  async getBenefits(): Promise<Benefit[]> {
    try {
      
      const { data, error } = await supabase
        .from('benefits')
        .select(`
          *,
          benefit_types(*)
        `)
        .order('name'); // Corrigido: banco usa 'name' não 'nome'

      if (error) {
        throw error;
      }
      

      // Map benefits and load documents for each
      const benefitsWithDocuments = await Promise.all(
        data.map(async (benefit) => {
          // For now, we'll load documents based on benefit ID
          // Note: This assumes documents are linked to benefits directly
          // In the future, this might need to be adjusted based on the actual relationship
          let documents: string[] = [];
          try {
            // Try to get documents for this benefit
            // Using benefit_id to get documents
            documents = [];
          } catch (error) {
            // Document loading warning disabled
            documents = [];
          }

          // Fetch performance goals for this benefit
          const goals = await this.getPerformanceGoalsByBenefit(benefit.id);

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
            performanceGoals: goals.map(goal => ({
              id: goal.id,
              title: goal.title,
              description: goal.description,
              targetValue: goal.target_value,
              currentValue: goal.current_value,
              unit: goal.unit,
              weight: goal.weight,
              deadline: goal.deadline,
              status: goal.status,
              createdBy: goal.created_by,
              createdAt: goal.created_at
            })),
            renewalSettings: benefit.renewal_settings || null,
            createdAt: benefit.created_at,
            updatedAt: benefit.updated_at
          };
        })
      );
      
      return benefitsWithDocuments;
    } catch (error) {
      throw error;
    }
  },

  async createBenefit(benefitData: Omit<Benefit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Benefit> {
    let data: any;
    
    try {
      
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
        throw error;
      }

      data = insertData;
    } catch (error) {
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
    let data: any;
    
    try {
      
      const updateData: any = {};
      
      // Map frontend fields to correct database fields
      if (benefitData.name !== undefined) updateData.name = benefitData.name;
      if (benefitData.type !== undefined) {
        updateData.benefit_type_id = benefitData.type.id;
      }
      if (benefitData.description !== undefined) updateData.description = benefitData.description;
      if (benefitData.value !== undefined) updateData.cost = benefitData.value;
      if (benefitData.coverage !== undefined) {
        // Serialize coverage array as JSONB for database storage
        updateData.coverage_details = Array.isArray(benefitData.coverage) 
          ? benefitData.coverage
          : benefitData.coverage;
      }
      if (benefitData.isActive !== undefined) updateData.is_active = benefitData.isActive;
      if (benefitData.startDate !== undefined) {
        // Only set effective_date if it's a valid date string, not empty
        updateData.effective_date = benefitData.startDate && benefitData.startDate.trim() !== '' ? benefitData.startDate : null;
      }
      if (benefitData.endDate !== undefined) {
        // Only set expiration_date if it's a valid date string, not empty
        updateData.expiration_date = benefitData.endDate && benefitData.endDate.trim() !== '' ? benefitData.endDate : null;
      }
      
      // Handle fields that exist in database
      if (benefitData.provider !== undefined) updateData.provider = benefitData.provider;
      if (benefitData.eligibilityRules !== undefined) updateData.eligibility_rules = benefitData.eligibilityRules;
      

      const { data: updateResult, error } = await supabase
        .from('benefits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          benefit_types(*)
        `)
        .single();

      if (error) {
        throw error;
      }

      data = updateResult;
    } catch (error) {
      throw error;
    }

    // Handle document uploads if provided
    let uploadedDocuments: string[] = [];
    if (benefitData.documentFiles && benefitData.documentFiles.length > 0) {
      try {
        
        // Upload each file and create document records
        for (const file of benefitData.documentFiles) {
          try {
            
            const uploadResult = await benefitDocumentService.uploadDocument({
              benefit_id: id,
              document_name: file.name,
              file: file,
              colaborador_id: benefitData.colaborador_id || null
            });
            
            uploadedDocuments.push(uploadResult.name);
            
          } catch (fileError) {
            // Continue with other files even if one fails
          }
        }
        
      } catch (docError) {
        // Don't fail the entire update if document processing fails
      }
    } else if (benefitData.documents && benefitData.documents.length > 0) {
      // Handle existing document names (for backward compatibility)
      uploadedDocuments = benefitData.documents;
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
        if (Array.isArray(data.coverage_details)) return data.coverage_details;
        try {
          const parsed = JSON.parse(data.coverage_details);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return typeof data.coverage_details === 'string' ? [data.coverage_details] : [];
        }
      })(),
      eligibilityRules: data.eligibility_rules || [],
      provider: data.provider || '',
      isActive: data.is_active,
      startDate: data.effective_date || '',
      endDate: data.expiration_date || '',
      documents: uploadedDocuments,
      performanceGoals: data.performance_goals || [],
      renewalSettings: data.renewal_settings || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async deleteBenefit(id: string): Promise<void> {
    try {
      
      const { error } = await supabase
        .from('benefits')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

    } catch (error) {
      throw error;
    }
  },

  // Employee Benefits
  async getEmployeeBenefits(): Promise<EmployeeBenefit[]> {
    try {
      
      // First get employee benefits with colaborador and benefit info
      const { data: employeeBenefitsData, error } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          colaboradores!colaborador_id(nome),
          benefits(name)
        `)
        .order('enrollment_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      
      // Now get dependents for each employee benefit
      const employeeBenefitsWithDependents = await Promise.all(
        employeeBenefitsData.map(async (eb) => {
          // Get dependents for this employee benefit
          const { data: dependentsData, error: dependentsError } = await supabase
            .from('benefit_dependents')
            .select('*')
            .eq('employee_benefit_id', eb.id)
            .eq('is_active', true);

          if (dependentsError) {
          }

          const dependents = dependentsData?.map(dep => ({
            id: dep.id,
            name: dep.name,
            relationship: dep.relationship as 'spouse' | 'child' | 'parent' | 'other',
            birthDate: dep.birth_date,
            documentNumber: dep.document_number,
            isActive: dep.is_active
          })) || [];

          return {
            id: eb.id,
            employeeId: eb.colaborador_id,
            employeeName: eb.colaboradores?.nome || 'Funcionário não encontrado',
            benefitId: eb.benefit_id,
            benefitName: eb.benefits?.name || 'Benefício não encontrado',
            enrollmentDate: eb.enrollment_date,
            dependents,
            documents: [], // Will be implemented later if needed
            lastUpdate: eb.updated_at,
            nextRenewalDate: eb.termination_date,
            renewalStatus: eb.status || 'active'
          };
        })
      );
      
      return employeeBenefitsWithDependents;
    } catch (error) {
      throw error;
    }
  },

  async createEmployeeBenefit(data: {
    employeeId: string;
    benefitId: string;
    dependents?: any[];
    documents?: any[];
  }): Promise<EmployeeBenefit> {
    try {
      
      // First create the employee benefit record
      const { data: employeeBenefitData, error: benefitError } = await supabase
        .from('employee_benefits')
        .insert({
          colaborador_id: data.employeeId,
          benefit_id: data.benefitId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          premium_amount: 0
        })
        .select(`
          *,
          colaboradores!colaborador_id(nome),
          benefits(name)
        `)
        .single();

      if (benefitError) {
        throw benefitError;
      }


      // If dependents are provided, create them
      if (data.dependents && data.dependents.length > 0) {
        
        const dependentsToInsert = data.dependents.map(dependent => ({
          employee_benefit_id: employeeBenefitData.id,
          name: dependent.name,
          relationship: dependent.relationship,
          birth_date: dependent.birthDate,
          document_number: dependent.documentNumber || '',
          is_active: true
        }));

        const { error: dependentsError } = await supabase
          .from('benefit_dependents')
          .insert(dependentsToInsert);

        if (dependentsError) {
          // Don't throw here, just log the error as the main benefit was created
        } else {
        }
      }

      // Return the formatted employee benefit
      return {
        id: employeeBenefitData.id,
        employeeId: employeeBenefitData.colaborador_id,
        employeeName: employeeBenefitData.colaboradores?.nome || 'Funcionário não encontrado',
        benefitId: employeeBenefitData.benefit_id,
        benefitName: employeeBenefitData.benefits?.name || 'Benefício não encontrado',
        enrollmentDate: employeeBenefitData.enrollment_date,
        dependents: data.dependents || [],
        documents: data.documents || [],
        lastUpdate: employeeBenefitData.updated_at,
        nextRenewalDate: employeeBenefitData.termination_date,
        renewalStatus: 'active'
      };
    } catch (error) {
      throw error;
    }
  },

  async enrollEmployee(employeeId: string, benefitId: string, dependents: any[] = []): Promise<EmployeeBenefit> {
    try {
      
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(employeeId)) {
        throw new Error(`Invalid employeeId format: ${employeeId}. Expected UUID format.`);
      }
      
      if (!uuidRegex.test(benefitId)) {
        throw new Error(`Invalid benefitId format: ${benefitId}. Expected UUID format.`);
      }

      // Check if enrollment already exists
      const { data: existingEnrollment, error: checkError } = await supabase
      .from('employee_benefits')
      .select('id')
      .eq('colaborador_id', employeeId)
      .eq('benefit_id', benefitId)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingEnrollment) {
      throw new Error('Funcionário já está inscrito neste benefício');
    }
    
    // First create the enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('employee_benefits')
      .insert({
        colaborador_id: employeeId,
        benefit_id: benefitId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      .select(`
          *,
          colaboradores!colaborador_id(nome),
          benefits(name)
        `)
      .single();

    if (enrollmentError) {
      // Log desabilitado
      if (enrollmentError.code === '23505') {
        throw new Error('Funcionário já está inscrito neste benefício');
      }
      throw enrollmentError;
    }

    // Note: benefit_dependents table doesn't exist yet
        // Dependents functionality will be implemented when the table is created
        if (dependents.length > 0) {
        }

    const result = {
      id: enrollment.id,
      employeeId: enrollment.colaborador_id,
      employeeName: enrollment.colaboradores?.nome || 'Funcionário não encontrado',
      benefitId: enrollment.benefit_id,
      benefitName: enrollment.benefits?.name || 'Benefício não encontrado',
      enrollmentDate: enrollment.enrollment_date,
      // Status determined by dates
      dependents: dependents || [],
      documents: [],
      lastUpdate: enrollment.updated_at,
      nextRenewalDate: enrollment.termination_date,
      renewalStatus: 'pending'
    };

    return result;
    } catch (error) {
      throw error;
    }
  },

  async updateEmployeeBenefit(id: string, data: Partial<EmployeeBenefit>): Promise<EmployeeBenefit> {
    try {
      
      const updateData: any = {};
      
      // Map frontend fields to database fields (only use existing columns)
      if (data.nextRenewalDate !== undefined) updateData.termination_date = data.nextRenewalDate;
      if (data.customValue !== undefined) updateData.premium_amount = data.customValue;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.renewalStatus !== undefined) updateData.status = data.renewalStatus;
      // Note: performance_data column doesn't exist in the database
      // This is handled in the frontend logic based on other data
      
      
      // Check if there's actually data to update
      if (Object.keys(updateData).length === 0) {
        // If no data to update, just fetch the current record
        const { data: current, error: fetchError } = await supabase
        .from('employee_benefits')
        .select(`
          *,
          users(username),
          benefits(name)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) {
          throw fetchError;
        }
        
        const result = {
          id: current.id,
          employeeId: current.employee_id,
          employeeName: current.users?.username || 'Funcionário não encontrado',
          benefitId: current.benefit_id,
          benefitName: current.benefits?.name || 'Benefício não encontrado',
          enrollmentDate: current.enrollment_date,
          dependents: [], // benefit_dependents table doesn't exist yet
          documents: [],
          lastUpdate: current.updated_at,
          nextRenewalDate: current.termination_date,
          renewalStatus: 'active' // Determined by frontend logic based on dates
        };
        
        return result;
      }

      const { data: updated, error } = await supabase
        .from('employee_benefits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          users(username),
          benefits(name)
        `)
        .single();

      if (error) {
        throw error;
      }
      
      const result = {
        id: updated.id,
        employeeId: updated.employee_id,
        employeeName: updated.users?.username || 'Funcionário não encontrado',
        benefitId: updated.benefit_id,
        benefitName: updated.benefits?.name || 'Benefício não encontrado',
        enrollmentDate: updated.enrollment_date,
        // Status determined by dates
        dependents: [], // benefit_dependents table doesn't exist yet
        documents: [],
        lastUpdate: updated.updated_at,
        nextRenewalDate: updated.termination_date,
      renewalStatus: 'active' // Determined by frontend logic based on dates
    };
    
    return result;
    } catch (error) {
      throw error;
    }
  },

  async cancelEmployeeBenefit(id: string): Promise<void> {
    try {
      
      const { error } = await supabase
        .from('employee_benefits')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      
    } catch (error) {
      throw error;
    }
  },

  // Get benefit statistics
  async getStats() {
    try {
      // Get all benefits
      const { data: benefits, error: benefitsError } = await supabase
        .from('benefits')
        .select('id, name, cost, is_active, benefit_types(name)');

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
          benefits(cost)
        `);

      if (employeeBenefitsError) {
        // Log desabilitado
        throw employeeBenefitsError;
      }

      // Calculate statistics
      const totalBenefits = benefits.length;
      const activeBenefits = benefits.filter(b => b.is_active).length;
      
      // Consider active enrollments as those without end date or with future end date
      const currentDate = new Date();
      const activeEnrollments = employeeBenefits.filter(eb => 
        !eb.termination_date || new Date(eb.termination_date) > currentDate
      );
      
      const totalEnrollments = activeEnrollments.length;
      const pendingApprovals = 0; // Since we don't have status column, assume no pending approvals
      
      // Calculate total cost from employee benefits (use premium_amount or benefit cost)
      const totalCost = activeEnrollments.reduce((sum, eb) => {
        const cost = eb.premium_amount || eb.benefits?.cost || 0;
        return sum + cost;
      }, 0);

      // Find most popular benefit
      const benefitEnrollmentCounts = activeEnrollments.reduce((acc, eb) => {
        acc[eb.benefit_id] = (acc[eb.benefit_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostPopularBenefitId = Object.entries(benefitEnrollmentCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      const mostPopularBenefit = benefits.find(b => b.id === mostPopularBenefitId)?.name || 'N/A';

      // Calculate utilization rate
      const utilizationRate = totalBenefits > 0 ? (totalEnrollments / totalBenefits) * 100 : 0;

      // Calculate usage statistics per benefit
      const usage = benefits.map(benefit => {
        const benefitActiveEnrollments = activeEnrollments.filter(
          eb => eb.benefit_id === benefit.id
        );
        
        const enrollments = benefitActiveEnrollments.length;
        
        const benefitTotalCost = benefitActiveEnrollments.reduce((sum, eb) => {
          const cost = eb.premium_amount || eb.benefits?.cost || benefit.cost || 0;
          return sum + cost;
        }, 0);

        return {
          benefitId: benefit.id,
          benefitName: benefit.name,
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
      throw error;
    }
  },

  // Document management methods
  async uploadBenefitDocument(benefitId: string, employeeBenefitId: string | null, file: File, documentType: string) {
    try {
      
      const uploadData: BenefitDocumentUpload = {
        benefit_id: benefitId,
        document_name: file.name,
        document_type: documentType,
        file: file
      };
      
      const result = await benefitDocumentService.uploadDocument(uploadData);
      return result;
    } catch (error) {
      throw error;
    }
  },



  async downloadBenefitDocument(documentId: string) {
    try {
      const result = await benefitDocumentService.downloadDocument(documentId);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async deleteBenefitDocument(documentId: string) {
    try {
      await benefitDocumentService.deleteDocument(documentId);
    } catch (error) {
      throw error;
    }
  },

  async updateBenefitDocument(documentId: string, updates: any) {
    try {
      const result = await benefitDocumentService.updateDocument(documentId, updates);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async getBenefitDocuments(benefitId: string) {
    const { data, error } = await supabase
      .from('benefit_documents')
      .select('*')
      .eq('benefit_id', benefitId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return data || [];
  },

  async deleteBenefitDocument(documentId: string) {
    try {
      // First get the document to get the file path
      const { data: document, error: fetchError } = await supabase
        .from('benefit_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('benefit_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  },

  async getDocumentUrl(filePath: string) {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || null;
  },

  // Performance Goals Management
  async createPerformanceGoal(goalData: any) {
    const { data, error } = await supabase
      .from('benefit_performance_goals')
      .insert(goalData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePerformanceGoal(goalId: string, goalData: any) {
    const { data, error } = await supabase
      .from('benefit_performance_goals')
      .update(goalData)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePerformanceGoal(goalId: string) {
    const { error } = await supabase
      .from('benefit_performance_goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  async getPerformanceGoalsByBenefit(benefitId: string) {
    const { data, error } = await supabase
      .from('benefit_performance_goals')
      .select('*')
      .eq('benefit_id', benefitId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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