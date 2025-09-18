
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Settings, FileText, Calendar, Award, Lock, MessageSquare, BarChart3, Gift, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { notifyPermissionChange } from '@/utils/redirectUtils';

interface ModulePermission {
  id: string;
  role_name: string;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionDefinition {
  key: string;
  module: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Simplified permission definitions - Only main system modules
const permissionDefinitions: PermissionDefinition[] = [
  {
    key: 'dashboard',
    module: 'Dashboard',
    description: 'Acesso ao painel principal',
    icon: BarChart3
  },
  {
    key: 'usuarios',
    module: 'Usuários',
    description: 'Gerenciar usuários do sistema',
    icon: Users
  },
  {
    key: 'documentos',
    module: 'Documentos',
    description: 'Gerenciar documentos',
    icon: FileText
  },
  {
    key: 'agenda',
    module: 'Agenda',
    description: 'Gerenciar agenda e eventos',
    icon: Calendar
  },
  {
    key: 'avaliacoes',
    module: 'Avaliações',
    description: 'Gerenciar avaliações de desempenho',
    icon: Award
  },
  {
    key: 'folha_pagamento',
    module: 'Folha de Pagamento',
    description: 'Gerenciar folha de pagamento',
    icon: Briefcase
  },
  {
    key: 'ferias',
    module: 'Férias',
    description: 'Gerenciar férias e licenças',
    icon: Calendar
  },
  {
    key: 'reconhecimento',
    module: 'Reconhecimento',
    description: 'Gerenciar reconhecimento e recompensas',
    icon: Award
  },
  {
    key: 'beneficios',
    module: 'Benefícios',
    description: 'Gerenciar benefícios',
    icon: Gift
  },
  {
    key: 'whatsapp',
    module: 'WhatsApp',
    description: 'Gerenciar integração WhatsApp',
    icon: MessageSquare
  },
  {
    key: 'configuracoes',
    module: 'Configurações',
    description: 'Gerenciar configurações do sistema',
    icon: Settings
  }
];

interface PermissionsDialogProps {
  children: React.ReactNode;
}

export const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ children }) => {
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userPermissions, forceRefreshPermissions } = usePermissionsV2();

  // Available roles based on TODO.md simplification
  const roles = ['gestor_rh', 'gerente'];

  // Load permissions from database on component mount
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role_name, module_name');

      if (error) {
        throw error;
      }

      setModulePermissions(data || []);
    } catch (error) {

      toast({
        title: "Erro ao carregar permissões",
        description: "Não foi possível carregar as permissões do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has permission to access settings (only super_admin and admin)
  if (!userPermissions.isSuperAdmin && !userPermissions.isAdmin) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para gerenciar permissões do sistema. Entre em contato com um administrador.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const getPermissionForRoleAndModule = (roleName: string, moduleName: string) => {
    return modulePermissions.find(p => p.role_name === roleName && p.module_name === moduleName);
  };

  const handlePermissionChange = async (roleName: string, moduleName: string, permissionType: 'can_view' | 'can_create' | 'can_edit' | 'can_delete', value: boolean) => {
    try {
      const existingPermission = getPermissionForRoleAndModule(roleName, moduleName);
      
      const updatedPermission = {
        role_name: roleName,
        module_name: moduleName,
        can_view: existingPermission?.can_view || false,
        can_create: existingPermission?.can_create || false,
        can_edit: existingPermission?.can_edit || false,
        can_delete: existingPermission?.can_delete || false,
        [permissionType]: value
      };

      const { error } = await supabase
        .from('role_permissions')
        .upsert(updatedPermission, {
          onConflict: 'role_name,module_name'
        });

      if (error) {
        throw error;
      }

      // Update local state
      setModulePermissions(prev => {
        const filtered = prev.filter(p => !(p.role_name === roleName && p.module_name === moduleName));
        return [...filtered, updatedPermission as ModulePermission];
      });

      // Notificar mudança de permissões para invalidar cache e redirecionar
      notifyPermissionChange();
      
      // Forçar atualização das permissões no hook
      await forceRefreshPermissions();
      
      // Refresh permissions in the hook to update the UI dynamically
      refreshPermissions();

      toast({
        title: "Permissão atualizada",
        description: `Permissão ${value ? 'concedida' : 'removida'} com sucesso`
      });
    } catch (error) {

      toast({
        title: "Erro",
        description: "Erro ao atualizar permissão",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'gestor_rh': 'bg-blue-100 text-blue-800',
      'gerente': 'bg-green-100 text-green-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getRoleDisplayName = (role: string) => {
    const names = {
      'gestor_rh': 'Gestor de RH',
      'gerente': 'Gerente'
    };
    return names[role as keyof typeof names] || role;
  };



  const resetGestorRHPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Basic permissions for gestor_rh
      const basicModules = ['dashboard', 'usuarios', 'ferias', 'beneficios'];
      
      for (const permDef of permissionDefinitions) {
        const isBasicModule = basicModules.includes(permDef.key);
        
        const updatedPermission = {
          role_name: 'gestor_rh',
          module_name: permDef.key,
          can_view: isBasicModule,
          can_create: isBasicModule && permDef.key !== 'dashboard',
          can_edit: isBasicModule && permDef.key !== 'dashboard',
          can_delete: false
        };

        const { error } = await supabase
          .from('role_permissions')
          .upsert(updatedPermission, {
            onConflict: 'role_name,module_name'
          });

        if (error) {
          throw error;
        }
      }

      await loadPermissions();
      
      // Notificar mudança de permissões para invalidar cache e redirecionar
      notifyPermissionChange();
      
      // Forçar atualização das permissões no hook
      await forceRefreshPermissions();
      
      // Refresh permissions in the hook to update the UI dynamically
      refreshPermissions();
      
      toast({
        title: "Permissões atualizadas",
        description: "Permissões básicas foram definidas para o Gestor de RH"
      });
    } catch (error) {

      toast({
        title: "Erro",
        description: "Erro ao resetar permissões",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Configure as permissões de acesso para cada perfil de usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Roles Legend */}
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <Badge key={role} className={getRoleBadge(role)}>
                {getRoleDisplayName(role)}
              </Badge>
            ))}
          </div>

          {/* Permissions Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descrição</TableHead>
                  {roles.map(role => (
                    <TableHead key={role} className="text-center min-w-[120px]">
                      <div className="space-y-1">
                        <div className="font-medium">{getRoleDisplayName(role)}</div>
                        <div className="text-xs text-muted-foreground grid grid-cols-4 gap-1">
                          <span>Ver</span>
                          <span>Criar</span>
                          <span>Editar</span>
                          <span>Excluir</span>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={roles.length + 2} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando permissões...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  permissionDefinitions.map((permissionDef) => {
                    const IconComponent = permissionDef.icon;
                    return (
                      <TableRow key={permissionDef.key}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="font-medium">{permissionDef.module}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground">{permissionDef.description}</span>
                        </TableCell>
                        {roles.map(role => {
                          const permission = getPermissionForRoleAndModule(role, permissionDef.key);
                          
                          return (
                            <TableCell key={role} className="text-center">
                              <div className="grid grid-cols-4 gap-1">
                                <Switch
                                  size="sm"
                                  checked={permission?.can_view || false}
                                  onCheckedChange={(value) => 
                                    handlePermissionChange(role, permissionDef.key, 'can_view', value)
                                  }
                                  disabled={isLoading}
                                />
                                <Switch
                                  size="sm"
                                  checked={permission?.can_create || false}
                                  onCheckedChange={(value) => 
                                    handlePermissionChange(role, permissionDef.key, 'can_create', value)
                                  }
                                  disabled={isLoading}
                                />
                                <Switch
                                  size="sm"
                                  checked={permission?.can_edit || false}
                                  onCheckedChange={(value) => 
                                    handlePermissionChange(role, permissionDef.key, 'can_edit', value)
                                  }
                                  disabled={isLoading}
                                />
                                <Switch
                                  size="sm"
                                  checked={permission?.can_delete || false}
                                  onCheckedChange={(value) => 
                                    handlePermissionChange(role, permissionDef.key, 'can_delete', value)
                                  }
                                  disabled={isLoading}
                                />
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetGestorRHPermissions}
              disabled={isLoading}
            >
              Resetar Gestor RH
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Atualizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
