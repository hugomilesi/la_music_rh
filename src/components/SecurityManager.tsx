import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Zap, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  Play 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: SecurityFixResult;
}

interface SecurityFixResult {
  success: boolean;
  message: string;
  details?: any;
}

interface SecurityManagerProps {
  children?: React.ReactNode;
}

export function SecurityManager({ children }: SecurityManagerProps) {
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

  if (children) {
    return <>{children}</>;
  }

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
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciador de Segurança</h2>
            <p className="text-sm text-gray-600 mt-1">
              Execute correções automáticas de segurança e otimizações
            </p>
          </div>
          <Button 
            onClick={executeSecurityPlan}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Plano
              </>
            )}
          </Button>
        </div>

        {isRunning && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`border rounded-lg p-4 transition-all ${
                currentStep === index && isRunning 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {step.result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(showDetails === step.id ? null : step.id)}
                    >
                      {showDetails === step.id ? 'Ocultar' : 'Detalhes'}
                    </Button>
                  )}
                </div>
              </div>
              
              {showDetails === step.id && step.result && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-2">
                      {step.result.message}
                    </div>
                    {step.result.details && (
                      <pre className="text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(step.result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}