import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Shield, Zap, Trash2, Search } from 'lucide-react';
import { securityService, SecurityFixResult } from '@/services/securityService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

interface SecurityStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: SecurityFixResult;
}

export const SecurityManager: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { canViewModule } = usePermissions();

  useEffect(() => {
    // Security manager mounted
    return () => {
      // Security manager unmounted
    };
  }, [user, profile, canViewModule]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!canViewModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  if (children) {
    return <>{children}</>;
  }
  const [steps, setSteps] = useState<SecurityStep[]>([
    {
      id: 'functions',
      title: 'Correções Críticas de Segurança',
      description: 'Aplicar SECURITY DEFINER em funções vulneráveis',
      icon: <Shield className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'rls',
      title: 'Otimização de Políticas RLS',
      description: 'Melhorar performance das políticas de segurança',
      icon: <Zap className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'indexes',
      title: 'Limpeza de Índices',
      description: 'Remover índices não utilizados',
      icon: <Trash2 className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'verification',
      title: 'Verificação Final',
      description: 'Validar configurações de segurança',
      icon: <Search className="h-5 w-5" />,
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const updateStepStatus = (stepId: string, status: SecurityStep['status'], result?: SecurityFixResult) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, result } : step
    ));
  };

  const executeSecurityPlan = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      // Primeiro, executar as funções SQL diretamente
      // Log desabilitado: Executando correções via SQL
      
      // Fase 1: Correções críticas de segurança
      setCurrentStep(0);
      updateStepStatus('functions', 'running');
      setProgress(10);
      
      try {
        const { data: securityResult, error: securityError } = await supabase.rpc('execute_security_fixes');
        
        if (securityError) {
          // Log desabilitado: Erro nas correções de segurança
          updateStepStatus('functions', 'error', {
            success: false,
            message: 'Erro ao aplicar correções de segurança',
            details: securityError
          });
        } else {

          updateStepStatus('functions', 'success', {
            success: true,
            message: 'Correções de segurança aplicadas com sucesso',
            details: securityResult
          });
        }
      } catch (error) {
        // Log desabilitado: Erro ao executar correções de segurança
        updateStepStatus('functions', 'error', {
          success: false,
          message: 'Erro ao executar correções de segurança',
          details: error
        });
      }
      
      setProgress(25);
      
      // Fase 2: Otimização de políticas RLS
      setCurrentStep(1);
      updateStepStatus('rls', 'running');
      setProgress(35);
      
      try {
        const { error: rlsError } = await supabase.rpc('optimize_rls_policies');
        
        if (rlsError) {
          // Log desabilitado: Erro na otimização RLS
          updateStepStatus('rls', 'error', {
            success: false,
            message: 'Erro ao otimizar políticas RLS',
            details: rlsError
          });
        } else {

          updateStepStatus('rls', 'success', {
            success: true,
            message: 'Políticas RLS otimizadas com sucesso'
          });
        }
      } catch (error) {
        // Log desabilitado: Erro ao otimizar RLS
        updateStepStatus('rls', 'error', {
          success: false,
          message: 'Erro ao otimizar políticas RLS',
          details: error
        });
      }
      
      setProgress(50);
      
      // Fase 3: Limpeza de índices
      setCurrentStep(2);
      updateStepStatus('indexes', 'running');
      setProgress(60);
      
      try {
        const { data: cleanupResult, error: cleanupError } = await supabase.rpc('cleanup_unused_indexes');
        
        if (cleanupError) {
          // Log desabilitado: Erro na limpeza de índices
          updateStepStatus('indexes', 'error', {
            success: false,
            message: 'Erro ao limpar índices',
            details: cleanupError
          });
        } else {

          updateStepStatus('indexes', 'success', {
            success: true,
            message: 'Limpeza de índices concluída',
            details: cleanupResult
          });
        }
      } catch (error) {
        // Log desabilitado: Erro ao limpar índices
        updateStepStatus('indexes', 'error', {
          success: false,
          message: 'Erro ao limpar índices',
          details: error
        });
      }
      
      setProgress(75);
      
      // Fase 4: Verificação final
      setCurrentStep(3);
      updateStepStatus('verification', 'running');
      setProgress(85);
      
      try {
        const { data: verificationResult, error: verificationError } = await supabase.rpc('verify_security_configuration');
        
        if (verificationError) {
          // Log desabilitado: Erro na verificação
          updateStepStatus('verification', 'error', {
            success: false,
            message: 'Erro na verificação de segurança',
            details: verificationError
          });
        } else {

          updateStepStatus('verification', 'success', {
            success: true,
            message: 'Verificação de segurança concluída',
            details: verificationResult
          });
        }
      } catch (error) {
        // Log desabilitado: Erro na verificação
        updateStepStatus('verification', 'error', {
          success: false,
          message: 'Erro na verificação de segurança',
          details: error
        });
      }
      
      setProgress(100);
      // Log desabilitado: Plano de segurança executado com sucesso
      
    } catch (error) {
      // Log desabilitado: Erro geral na execução do plano
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: SecurityStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: SecurityStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'running':
        return <Badge variant="secondary">Executando...</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gerenciador de Segurança
          </CardTitle>
          <CardDescription>
            Execute as correções de segurança identificadas na auditoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Progresso da Execução</h3>
              <p className="text-sm text-muted-foreground">
                {isRunning ? `Executando etapa ${currentStep + 1} de ${steps.length}` : 'Pronto para executar'}
              </p>
            </div>
            <Button 
              onClick={executeSecurityPlan} 
              disabled={isRunning}
              className="min-w-[120px]"
            >
              {isRunning ? 'Executando...' : 'Executar Plano'}
            </Button>
          </div>
          
          {isRunning && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {steps.map((step, index) => (
          <Card key={step.id} className={`transition-all duration-200 ${
            step.status === 'running' ? 'ring-2 ring-blue-500' : ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.icon}
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(step.status)}
                  {getStatusIcon(step.status)}
                </div>
              </div>
            </CardHeader>
            
            {step.result && (
              <CardContent className="pt-0">
                <Alert className={step.result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>{step.result.message}</span>
                      {step.result.details && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetails(showDetails === step.id ? null : step.id)}
                        >
                          {showDetails === step.id ? 'Ocultar' : 'Detalhes'}
                        </Button>
                      )}
                    </div>
                    
                    {showDetails === step.id && step.result.details && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <pre className="text-xs overflow-auto max-h-40">
                          {JSON.stringify(step.result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SecurityManager;