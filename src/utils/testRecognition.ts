import { RecognitionService } from '../services/recognitionService';
import { supabase } from '../lib/supabase';

// Função para testar a funcionalidade de reconhecimento
export async function testRecognitionIntegration() {
  console.log('🧪 Iniciando testes de integração do reconhecimento...');
  
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
    console.log('🔌 Testando conexão com banco...');
    const { data: testData, error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      results.errors.push(`Erro de conexão: ${connectionError.message}`);
    } else {
      results.connection = true;
      console.log('✅ Conexão com banco OK');
    }
    
    // Teste 2: Carregamento de programas
    console.log('📋 Testando carregamento de programas...');
    try {
      const programs = await RecognitionService.getPrograms();
      if (programs && programs.length > 0) {
        results.programs = true;
        console.log(`✅ ${programs.length} programas carregados:`);
        programs.forEach(p => console.log(`  - ${p.name} (${p.id})`));
      } else {
        results.errors.push('Nenhum programa encontrado');
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar programas: ${error}`);
    }
    
    // Teste 3: Carregamento de ranking
    console.log('🏆 Testando carregamento de ranking...');
    try {
      const ranking = await RecognitionService.getEmployeeRanking();
      if (ranking && ranking.length > 0) {
        results.ranking = true;
        console.log(`✅ ${ranking.length} funcionários no ranking`);
        console.log('Top 3:');
        ranking.slice(0, 3).forEach((emp, idx) => {
          console.log(`  ${idx + 1}. ${emp.employee_name} - ${emp.total_stars} estrelas`);
        });
      } else {
        results.errors.push('Nenhum funcionário encontrado no ranking');
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar ranking: ${error}`);
    }
    
    // Teste 4: Carregamento de conquistas
    console.log('🎖️ Testando carregamento de conquistas...');
    try {
      const achievements = await RecognitionService.getEmployeeAchievements();
      if (achievements && achievements.length > 0) {
        results.achievements = true;
        console.log(`✅ ${achievements.length} conquistas carregadas`);
        achievements.slice(0, 3).forEach(achievement => {
          console.log(`  - ${achievement.title} (${achievement.stars_awarded} estrelas)`);
        });
      } else {
        console.log('⚠️ Nenhuma conquista encontrada (isso é normal se não houver dados)');
        results.achievements = true; // Não é erro se não houver conquistas
      }
    } catch (error) {
      results.errors.push(`Erro ao carregar conquistas: ${error}`);
    }
    
    // Teste 5: Teste de criação de avaliação (apenas se houver dados)
    console.log('📝 Testando criação de avaliação...');
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
          console.log(`✅ Avaliação criada com sucesso (ID: ${evaluation.id})`);
          
          // Limpar dados de teste
          await supabase
            .from('employee_evaluations')
            .delete()
            .eq('id', evaluation.id);
          console.log('🧹 Dados de teste removidos');
        } else {
          results.errors.push('Falha ao criar avaliação de teste');
        }
      } else {
        console.log('⚠️ Pulando teste de avaliação - sem dados suficientes');
        results.evaluation = true; // Não é erro se não houver dados
      }
    } catch (error) {
      results.errors.push(`Erro no teste de avaliação: ${error}`);
    }
    
    // Resumo dos resultados
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log(`Conexão: ${results.connection ? '✅' : '❌'}`);
    console.log(`Programas: ${results.programs ? '✅' : '❌'}`);
    console.log(`Ranking: ${results.ranking ? '✅' : '❌'}`);
    console.log(`Conquistas: ${results.achievements ? '✅' : '❌'}`);
    console.log(`Avaliação: ${results.evaluation ? '✅' : '❌'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const allPassed = results.connection && results.programs && results.ranking && results.achievements && results.evaluation;
    
    if (allPassed) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM! A integração está funcionando corretamente.');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
    }
    
    return {
      success: allPassed,
      results,
      errors: results.errors
    };
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return {
      success: false,
      results,
      errors: [...results.errors, `Erro geral: ${error}`]
    };
  }
}

// Função para testar dados específicos
export async function testSpecificData() {
  console.log('🔍 Testando dados específicos...');
  
  try {
    // Verificar estrutura das tabelas
    const tables = ['users', 'recognition_programs', 'employee_evaluations', 'employee_achievements'];
    
    for (const table of tables) {
      console.log(`\n📋 Testando tabela: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro na tabela ${table}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${table}: ${count} registros`);
        if (data && data.length > 0) {
          console.log(`   Colunas: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    }
    
    // Verificar integridade dos dados
    console.log('\n🔗 Verificando integridade dos dados...');
    
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
          console.log(`⚠️ Funcionário ${evaluation.employee_id} não encontrado na tabela users`);
        }
      }
    }
    
    console.log('✅ Verificação de integridade concluída');
    
  } catch (error) {
    console.error('❌ Erro na verificação de dados:', error);
  }
}

// Função para executar no console do navegador
(window as any).testRecognition = testRecognitionIntegration;
(window as any).testSpecificData = testSpecificData;

console.log('🧪 Funções de teste carregadas!');
console.log('Execute testRecognition() ou testSpecificData() no console para testar.');