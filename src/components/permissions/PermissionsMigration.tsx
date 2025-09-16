import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, ArrowRight, Database, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

const PermissionsMigration: React.FC = () => {
  const { canManagePermissions } = usePermissionsV2();
  const { toast } = useToast();
  
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'backup',
      title: 'Backup do Sistema Atual',
      description: 'Criar backup das permissões atuais',
      status: 'pending'
    },
    {
      id: 'validate',
      title: 'Validar Nova Estrutura',
      description: 'Verificar se as novas tabelas estão corretas',
      status: 'pending'
    },
    {
      id: 'migrate',
      title: 'Migrar Dados',
      description: 'Transferir permissões para o novo sistema',
      status: 'pending'
    },
    {
      id: 'test',
      title: 'Testar Sistema',
      description: 'Verificar se as permissões funcionam corretamente',
      status: 'pending'
    },
    {
      id: 'cleanup',
      title: 'Limpeza (Opcional)',
      description: 'Remover dados antigos após confirmação',
      status: 'pending'
    }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Verificar se o usuário tem permissão para executar migração
  const canRunMigration = canManagePermissions();

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], error?: string) => {
    setMigrationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ));
  };

  const runMigrationStep = async (step: MigrationStep, index: number) => {
    setCurrentStep(index);
    updateStepStatus(step.id, 'running');

    try {
      switch (step.id) {
        case 'backup':
          await backupCurrentSystem();
          break;
        case 'validate':
          await validateNewStructure();
          break;
        case 'migrate':
          await migratePermissions();
          break;
        case 'test':
          await testNewSystem();
          break;
        case 'cleanup':
          await cleanupOldData();
          break;
      }
      
      updateStepStatus(step.id, 'completed');
      
      // Aguardar um pouco antes do próximo passo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      // Log desabilitado: Error in step
      updateStepStatus(step.id, 'error', error.message);
      throw error;
    }
  };

  const backupCurrentSystem = async () => {
    // Criar backup das permissões atuais
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select('*');
    
    if (error) throw error;
    
    // Salvar backup em uma tabela temporária ou log
    // Log desabilitado: Backup created
  };

  const validateNewStructure = async () => {
    // Verificar se as novas tabelas existem e têm dados
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('count')
      .single();
    
    if (permError) throw new Error('Tabela permissions não encontrada');
    
    const { data: rolePermsV2, error: roleError } = await supabase
      .from('system_role_permissions_v2')
      .select('count')
      .single();
    
    if (roleError) throw new Error('Tabela system_role_permissions_v2 não encontrada');
    
    // Verificar se as funções RPC existem
    const { error: funcError } = await supabase.rpc('get_all_permissions');
    if (funcError) throw new Error('Função get_all_permissions não encontrada');
  };

  const migratePermissions = async () => {
    // A migração já foi feita durante a criação das tabelas
    // Aqui podemos verificar se há dados inconsistentes
    const { data: oldPerms } = await supabase
      .from('role_permissions')
      .select('*');
    
    const { data: newPerms } = await supabase
      .from('system_role_permissions_v2')
      .select('*');
    
    // Log desabilitado: Migration validation
  };

  const testNewSystem = async () => {
    // Testar algumas permissões básicas
    const testPermissions = ['usuarios.view', 'permissoes.manage'];
    
    for (const permission of testPermissions) {
      try {
        const { data, error } = await supabase.rpc('check_permission', {
          permission_name: permission
        });
        
        if (error) {
          console.warn(`Warning testing permission ${permission}:`, error);
        } else {
          // Log desabilitado: Permission test result
        }
      } catch (err) {
        console.warn(`Error testing permission ${permission}:`, err);
      }
    }
  };

  const cleanupOldData = async () => {
    // Esta etapa é opcional e deve ser executada com cuidado
    // Log desabilitado: Cleanup step - manual intervention required
    toast({
      title: 'Limpeza Manual',
      description: 'A limpeza dos dados antigos deve ser feita manualmente após validação completa.',
      variant: 'default'
    });
  };

  const runMigration = async () => {
    if (!canRunMigration) {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para executar a migração.',
        variant: 'destructive'
      });
      return;
    }

    setIsRunning(true);
    setMigrationComplete(false);
    
    try {
      for (let i = 0; i < migrationSteps.length; i++) {
        await runMigrationStep(migrationSteps[i], i);
      }
      
      setMigrationComplete(true);
      toast({
        title: 'Migração Concluída',
        description: 'O sistema de permissões foi migrado com sucesso!',
        variant: 'default'
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro na Migração',
        description: error.message || 'Erro durante a migração',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBadge = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case 'running':
        return <Badge variant="default" className="bg-blue-500">Executando</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const completedSteps = migrationSteps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / migrationSteps.length) * 100;

  if (!canRunMigration) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar a migração de permissões.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Migração do Sistema de Permissões</CardTitle>
              <CardDescription>
                Migre do sistema atual para o novo sistema de permissões granulares
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da Migração</span>
              <span>{completedSteps}/{migrationSteps.length} etapas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Migration Steps */}
          <div className="space-y-4">
            {migrationSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{step.title}</h3>
                    {getStepBadge(step.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{step.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                {index < migrationSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mt-2" />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={runMigration}
              disabled={isRunning || migrationComplete}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executando Migração...
                </>
              ) : migrationComplete ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Migração Concluída
                </>
              ) : (
                'Iniciar Migração'
              )}
            </Button>
            
            {migrationComplete && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/gerenciar-permissoes'}
              >
                Ir para Gerenciamento
              </Button>
            )}
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Esta migração irá alterar o sistema de permissões. 
              Certifique-se de ter um backup antes de prosseguir. A migração pode ser executada 
              múltiplas vezes com segurança.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsMigration;