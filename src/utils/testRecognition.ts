import { RecognitionService } from '../services/recognitionService';
import { supabase } from '../lib/supabase';

// Função para testar a funcionalidade de reconhecimento
export async function testRecognitionIntegration() {

  
  const results = {
    connection: false,
    programs: false,
    ranking: false,
    achievements: false,
    evaluation: false,
    errors: [] as string[]
  };
  
  try {
    // Teste 1: Conexão com banco
    // Testing database connection logging disabled
    const { data: testData, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      results.errors.push(`Erro de conexão: ${connectionError.message}`);
    } else {
      results.connection = true;
    }
    
    // Teste 2: Carregamento de programas
    // Testing programs loading logging disabled
    try {
      const programs = await RecognitionService.getPrograms();
      if (programs && programs.length > 0) {
        results.programs = true;
        
      } else {
        results.errors.push('Nenhum programa encontrado');
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar programas: ${error}`);
    }
    
    // Teste 3: Carregamento de ranking
    // Testing ranking loading logging disabled
    try {
      const ranking = await RecognitionService.getEmployeeRanking();
      if (ranking && ranking.length > 0) {
        results.ranking = true;
      } else {
        results.errors.push('Nenhum funcionário encontrado no ranking');
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar ranking: ${error}`);
    }
    
    // Teste 4: Carregamento de conquistas
    // Testing achievements loading logging disabled
    try {
      const achievements = await RecognitionService.getEmployeeAchievements();
      if (achievements && achievements.length > 0) {
        results.achievements = true;
      } else {
        results.achievements = true; // Não é erro se não houver conquistas
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar conquistas: ${error}`);
    }
    
    // Teste 5: Teste de criação de avaliação (apenas se houver dados)
    // Testing evaluation creation logging disabled
    try {
      const ranking = await RecognitionService.getEmployeeRanking();
      const programs = await RecognitionService.getPrograms();
      
      if (ranking.length > 0 && programs.length > 0) {
        const employee = ranking[0];
        const program = programs[0];
        
        // Criar avaliação de teste
        const testEvaluation = {
          employee_id: employee.employee_id,
          program_id: program.id,
          evaluation_period: '2024-03',
          total_stars: 5,
          evaluated_by: 'test-system',
          evaluation_date: new Date().toISOString().split('T')[0],
          comments: 'Teste de integração automático'
        };
        
        const evaluation = await RecognitionService.createEmployeeEvaluation(testEvaluation);
        
        if (evaluation && evaluation.id) {
          results.evaluation = true;
          
          // Limpar dados de teste
          await supabase
            .from('employee_evaluations')
            .delete()
            .eq('id', evaluation.id);
        } else {
          results.errors.push('Falha ao criar avaliação de teste');
        }
      } else {
        results.evaluation = true; // Não é erro se não houver dados
      }
    } catch (error) {
      results.errors.push(`Erro no teste de avaliação: ${error}`);
    }
    
    // Resumo dos resultados

    
    if (results.errors.length > 0) {
      // Error reporting logging disabled
    
    }
    
    const allPassed = results.connection && results.programs && results.ranking && results.achievements && results.evaluation;
    
    if (allPassed) {
      // All tests passed
    } else {
      // Some tests failed logging disabled
    }
    
    return {
      success: allPassed,
      results,
      errors: results.errors
    };
    
  } catch (error) {
    // General test error logging disabled
    return {
      success: false,
      results,
      errors: [...results.errors, `Erro geral: ${error}`]
    };
  }
}

// Função para testar dados específicos
export async function testSpecificData() {
  // Testing specific data logging disabled
  
  try {
    // Verificar estrutura das tabelas
    const tables = ['users', 'recognition_programs', 'employee_evaluations', 'employee_achievements'];
    
    for (const table of tables) {
      // Testing table logging disabled
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        // Table error logging disabled
      } else {
        // Table check passed
      }
    }
    
    // Verificar integridade dos dados
    // Verifying data integrity logging disabled
    
    // Verificar se todos os employee_ids no ranking existem na tabela users
    const { data: evaluations } = await supabase
      .from('employee_evaluations')
      .select('employee_id')
      .limit(10);
    
    if (evaluations && evaluations.length > 0) {
      for (const evaluation of evaluations) {
        const { data: employee } = await supabase
          .from('users')
          .select('id')
          .eq('id', evaluation.employee_id)
          .single();
        
        if (!employee) {
          // Employee not found warning disabled
        }
      }
    }
    

    
  } catch (error) {
    // Data verification error logging disabled
  }
}

// Função para executar no console do navegador
(window as any).testRecognition = testRecognitionIntegration;
(window as any).testSpecificData = testSpecificData;

// Test functions loaded logging disabled
// Execute testRecognition() or testSpecificData() in console to test