
import React, { useEffect, useState } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { integrationTests } from '@/utils/integrationTests';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardPage: React.FC = () => {
  const [testResults, setTestResults] = useState<boolean | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await integrationTests.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running integration tests:', error);
      setTestResults(false);
    } finally {
      setIsRunningTests(false);
    }
  };

  useEffect(() => {
    // Run tests on component mount
    runTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Integration Test Status */}
      {import.meta.env.DEV && (
        <Alert variant={testResults === true ? "default" : testResults === false ? "destructive" : "default"}>
          <div className="flex items-center gap-2">
            {isRunningTests ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : testResults === true ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : testResults === false ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <AlertDescription className="flex-1">
              {isRunningTests 
                ? 'Executando testes de integração...'
                : testResults === true 
                ? 'Todos os testes de integração passaram ✅'
                : testResults === false
                ? 'Alguns testes de integração falharam ❌ - Verifique o console para detalhes'
                : 'Testes de integração não executados'
              }
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runTests} 
              disabled={isRunningTests}
            >
              {isRunningTests ? 'Executando...' : 'Executar Testes'}
            </Button>
          </div>
        </Alert>
      )}
      
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
