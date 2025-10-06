import { supabase } from '@/integrations/supabase/client';

export interface SecurityFixResult {
  success: boolean;
  message: string;
  details?: any;
}

export const securityService = {
  /**
   * Aplica correções de segurança críticas nas funções do banco
   */
  async applySecurityFixes(): Promise<SecurityFixResult> {
    try {
      
      // Fase 1: Correção das funções críticas com SECURITY DEFINER
      const functionsToFix = [
        'sync_user_tables',
        'create_admin_user', 
        'is_super_user',
        'handle_new_user',
        'is_admin',
        'prevent_privilege_escalation',
        'is_current_user_admin',
        'can_modify_user',
        'delete_user_by_id',
        'check_permission',
        'update_role_permissions',
        'soft_delete_record',
        'restore_record',
        'update_payrolls_updated_at',
        'auto_distribute_allocation',
        'get_employee_ranking'
      ];

      const results = [];
      
      for (const funcName of functionsToFix) {
        try {
          // Verificar se a função existe
          const { data: funcExists } = await supabase.rpc('check_function_exists', {
            function_name: funcName
          });
          
          if (funcExists) {
            // Aplicar SECURITY DEFINER e SET search_path
            const { error } = await supabase.rpc('apply_security_definer', {
              function_name: funcName
            });
            
            if (error) {
              results.push({ function: funcName, status: 'error', error: error.message });
            } else {
              results.push({ function: funcName, status: 'success' });
            }
          } else {
            results.push({ function: funcName, status: 'not_found' });
          }
        } catch (error) {
          results.push({ function: funcName, status: 'error', error: error });
        }
      }
      
      return {
        success: true,
        message: 'Correções de segurança aplicadas',
        details: results
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao aplicar correções de segurança',
        details: error
      };
    }
  },

  /**
   * Otimiza políticas RLS para melhor performance
   */
  async optimizeRLSPolicies(): Promise<SecurityFixResult> {
    try {
      
      // Executar otimizações de RLS usando função SQL
      const { error } = await supabase.rpc('optimize_rls_policies');
      
      if (error) {
        return {
          success: false,
          message: 'Erro ao otimizar políticas RLS',
          details: error
        };
      }
      

      return {
        success: true,
        message: 'Políticas RLS otimizadas com sucesso'
      };
      
    } catch (error) {

      return {
        success: false,
        message: 'Erro ao otimizar políticas RLS',
        details: error
      };
    }
  },

  /**
   * Remove índices não utilizados para otimização
   */
  async removeUnusedIndexes(): Promise<SecurityFixResult> {
    try {

      
      // Lista de índices identificados como não utilizados
      const unusedIndexes = [
        'idx_vacation_requests_employee_id',
        'idx_criterion_evaluations_evaluation_id',
        'idx_documents_employee_id',
        'idx_employee_benefits_employee_id',
        'idx_evaluations_employee_id',
        'idx_folha_pagamento_employee_id',
        'idx_folha_rateio_payroll_id',
        'idx_incidents_employee_id',
        'idx_nps_responses_survey_id',
        'idx_recognition_criteria_program_id',
        'idx_roles_department_id',
        'idx_schedule_events_employee_id',
        'idx_system_role_permissions_role_id',
        'idx_user_roles_user_id',
        'idx_benefit_documents_employee_id',
        'idx_users_auth_user_id',
        'idx_security_audit_log_user_id'
      ];
      
      const results = [];
      
      for (const indexName of unusedIndexes) {
        try {
          const { error } = await supabase.rpc('drop_index_if_exists', {
            index_name: indexName
          });
          
          if (error) {

            results.push({ index: indexName, status: 'error', error: error.message });
          } else {

            results.push({ index: indexName, status: 'removed' });
          }
        } catch (error) {

          results.push({ index: indexName, status: 'error', error: error });
        }
      }
      
      return {
        success: true,
        message: 'Remoção de índices não utilizados concluída',
        details: results
      };
      
    } catch (error) {

      return {
        success: false,
        message: 'Erro ao remover índices não utilizados',
        details: error
      };
    }
  },

  /**
   * Executa verificação de segurança pós-correções
   */
  async verifySecurityConfiguration(): Promise<SecurityFixResult> {
    try {

      
      const { data, error } = await supabase.rpc('verify_security_configuration');
      
      if (error) {

        return {
          success: false,
          message: 'Erro ao verificar configurações de segurança',
          details: error
        };
      }
      

      return {
        success: true,
        message: 'Verificação de segurança concluída',
        details: data
      };
      
    } catch (error) {

      return {
        success: false,
        message: 'Erro na verificação de segurança',
        details: error
      };
    }
  },

  /**
   * Executa todas as correções de segurança em sequência
   */
  async executeFullSecurityPlan(): Promise<SecurityFixResult[]> {

    
    const results: SecurityFixResult[] = [];
    
    // Fase 1: Correções críticas de segurança

    const securityFixes = await this.applySecurityFixes();
    results.push(securityFixes);
    
    // Fase 2: Otimização de políticas RLS

    const rlsOptimization = await this.optimizeRLSPolicies();
    results.push(rlsOptimization);
    
    // Fase 3: Remoção de índices não utilizados

    const indexCleanup = await this.removeUnusedIndexes();
    results.push(indexCleanup);
    
    // Fase 4: Verificação final

    const verification = await this.verifySecurityConfiguration();
    results.push(verification);
    

    return results;
  }
};