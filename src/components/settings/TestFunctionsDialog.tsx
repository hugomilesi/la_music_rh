import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { listAllSystemUsers, deleteSystemUser } from '@/services/settingsService';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const TestFunctionsDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Test basic Supabase connection
    try {
      addTestResult({ name: 'Conexão Supabase', status: 'pending', message: 'Testando...' });
      
      const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
      
      if (error) {
        addTestResult({ 
          name: 'Conexão Supabase', 
          status: 'error', 
          message: `Erro na conexão: ${error.message}`,
          details: error
        });
      } else {
        addTestResult({ 
          name: 'Conexão Supabase', 
          status: 'success', 
          message: `Conectado com sucesso. ${data?.length || 0} usuários encontrados.`
        });
      }
    } catch (error: any) {
      addTestResult({ 
        name: 'Conexão Supabase', 
        status: 'error', 
        message: `Erro inesperado: ${error.message}`
      });
    }

    // Test 2: Test list-all-users function
    try {
      addTestResult({ name: 'Função list-all-users', status: 'pending', message: 'Testando...' });
      
      const result = await listAllSystemUsers();
      
      if (result && result.success) {
        addTestResult({ 
          name: 'Função list-all-users', 
          status: 'success', 
          message: `Função funcionando. ${result.users?.length || 0} usuários encontrados.`,
          details: result.stats
        });
      } else {
        addTestResult({ 
          name: 'Função list-all-users', 
          status: 'error', 
          message: result?.error || 'Função retornou erro desconhecido',
          details: result
        });
      }
    } catch (error: any) {
      addTestResult({ 
        name: 'Função list-all-users', 
        status: 'error', 
        message: `Erro ao chamar função: ${error.message}`,
        details: error
      });
    }

    // Test 3: Test delete-user function (dry run)
    try {
      addTestResult({ name: 'Função delete-user (teste)', status: 'pending', message: 'Testando...' });
      
      // Try to call the function with a non-existent user ID to test if it's working
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: 'test-non-existent-user-id' }
      });
      
      if (error) {
        if (error.message.includes('non-2xx status code')) {
          addTestResult({ 
            name: 'Função delete-user (teste)', 
            status: 'warning', 
            message: 'Função está ativa mas retornou erro (esperado para ID inexistente)',
            details: error
          });
        } else {
          addTestResult({ 
            name: 'Função delete-user (teste)', 
            status: 'error', 
            message: `Erro na função: ${error.message}`,
            details: error
          });
        }
      } else {
        addTestResult({ 
          name: 'Função delete-user (teste)', 
          status: 'success', 
          message: 'Função respondeu corretamente',
          details: data
        });
      }
    } catch (error: any) {
      addTestResult({ 
        name: 'Função delete-user (teste)', 
        status: 'error', 
        message: `Erro ao chamar função: ${error.message}`,
        details: error
      });
    }

    // Test 4: Check database synchronization
    try {
      addTestResult({ name: 'Sincronização de Tabelas', status: 'pending', message: 'Verificando...' });
      
      const result = await listAllSystemUsers();
      
      if (result && result.success && result.stats) {
        const { orphanedAuthUsers, usersWithoutEmployee } = result.stats;
        
        if (orphanedAuthUsers === 0 && usersWithoutEmployee === 0) {
          addTestResult({ 
            name: 'Sincronização de Tabelas', 
            status: 'success', 
            message: 'Todas as tabelas estão sincronizadas',
            details: result.stats
          });
        } else {
          addTestResult({ 
            name: 'Sincronização de Tabelas', 
            status: 'warning', 
            message: `${orphanedAuthUsers} usuários órfãos, ${usersWithoutEmployee} usuários sem dados completos`,
            details: result.stats
          });
        }
      } else {
        addTestResult({ 
          name: 'Sincronização de Tabelas', 
          status: 'error', 
          message: 'Não foi possível verificar sincronização'
        });
      }
    } catch (error: any) {
      addTestResult({ 
        name: 'Sincronização de Tabelas', 
        status: 'error', 
        message: `Erro ao verificar sincronização: ${error.message}`
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pending: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      pending: 'Executando',
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Atenção'
    };
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TestTube className="w-4 h-4 mr-2" />
          Testar Sistema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Diagnóstico do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Execute testes para verificar o funcionamento das funções do sistema.
            </p>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              {isRunning ? 'Executando...' : 'Executar Testes'}
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados dos Testes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={`result-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{result.name}</h4>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-gray-600">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              Ver detalhes
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};