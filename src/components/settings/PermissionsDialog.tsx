
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
import { Shield, Users, Settings, FileText, Calendar, Award, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RolePermissions {
  role: string;
  permissions: string[];
}

interface PermissionDefinition {
  key: string;
  module: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Permission definitions with their metadata
const permissionDefinitions: PermissionDefinition[] = [
  {
    key: 'canManageEmployees',
    module: 'Colaboradores',
    description: 'Visualizar e gerenciar colaboradores',
    icon: Users
  },
  {
    key: 'canManageDocuments',
    module: 'Documentos',
    description: 'Gerenciar documentos e arquivos',
    icon: FileText
  },
  {
    key: 'canManageSchedule',
    module: 'Agenda',
    description: 'Gerenciar eventos e compromissos',
    icon: Calendar
  },
  {
    key: 'canManageEvaluations',
    module: 'Avaliações',
    description: 'Criar e gerenciar avaliações',
    icon: Award
  },
  {
    key: 'canAccessSettings',
    module: 'Configurações',
    description: 'Acessar configurações do sistema',
    icon: Settings
  },
  {
    key: 'canCreateUsers',
    module: 'Usuários',
    description: 'Criar e gerenciar usuários',
    icon: Users
  },
  {
    key: 'canViewReports',
    module: 'Relatórios',
    description: 'Visualizar relatórios do sistema',
    icon: FileText
  },
  {
    key: 'canDeleteEmployees',
    module: 'Exclusão',
    description: 'Excluir colaboradores',
    icon: Users
  },
  {
    key: 'canPromoteUsers',
    module: 'Promoção',
    description: 'Promover usuários',
    icon: Users
  },
  {
    key: 'canExportData',
    module: 'Exportação',
    description: 'Exportar dados do sistema',
    icon: FileText
  },
  {
    key: 'canManageEverything',
    module: 'Super Admin',
    description: 'Acesso total ao sistema (Super Usuário)',
    icon: Shield
  }
];

interface PermissionsDialogProps {
  children: React.ReactNode;
}

export const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ children }) => {
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { permissions: userPermissions } = usePermissions();

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
        .order('role');

      if (error) {
        throw error;
      }

      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Erro ao carregar permissões",
        description: "Não foi possível carregar as permissões do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se o usuário tem permissão para acessar configurações
  if (!userPermissions.canAccessSettings) {
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

  const handlePermissionChange = (role: string, permissionKey: string, value: boolean) => {
    setRolePermissions(prev => prev.map(rolePermission => 
      rolePermission.role === role 
        ? {
            ...rolePermission,
            permissions: value 
              ? [...rolePermission.permissions.filter(p => p !== permissionKey), permissionKey]
              : rolePermission.permissions.filter(p => p !== permissionKey)
          }
        : rolePermission
    ));

    toast({
      title: "Permissão atualizada",
      description: `Permissão ${value ? 'concedida' : 'removida'} com sucesso`
    });
  };

  const handleSavePermissions = async () => {
    setIsLoading(true);
    try {
      // Update each role's permissions individually by directly updating the role_permissions table
      for (const rolePermission of rolePermissions) {
        const { error } = await supabase
          .from('role_permissions')
          .upsert({
            role: rolePermission.role,
            permissions: rolePermission.permissions
          }, {
            onConflict: 'role'
          });
        
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Permissões salvas",
        description: "As alterações de permissões foram salvas com sucesso!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as permissões. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'admin': 'bg-red-100 text-red-800',
      'coordenador': 'bg-blue-100 text-blue-800',
      'professor': 'bg-green-100 text-green-800',
      'usuario': 'bg-gray-100 text-gray-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Configure as permissões de acesso para cada perfil de usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Roles Legend */}
          <div className="flex flex-wrap gap-2">
            {rolePermissions.map(rolePermission => (
              <Badge key={rolePermission.role} className={getRoleBadge(rolePermission.role)}>
                {rolePermission.role === 'admin' ? 'Administrador' :
                 rolePermission.role === 'coordenador' ? 'Coordenador' :
                 rolePermission.role === 'professor' ? 'Professor' :
                 rolePermission.role === 'usuario' ? 'Usuário' :
                 rolePermission.role}
              </Badge>
            ))}
          </div>

          {/* Permissions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descrição</TableHead>
                  {rolePermissions.map(rolePermission => (
                    <TableHead key={rolePermission.role} className="text-center">
                      {rolePermission.role === 'admin' ? 'Admin' :
                       rolePermission.role === 'coordenador' ? 'Coordenador' :
                       rolePermission.role === 'professor' ? 'Professor' :
                       rolePermission.role === 'usuario' ? 'Usuário' :
                       rolePermission.role}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={rolePermissions.length + 2} className="text-center py-8">
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
                        <TableCell>{permissionDef.description}</TableCell>
                        {rolePermissions.map(rolePermission => (
                          <TableCell key={rolePermission.role} className="text-center">
                            <Switch
                              checked={rolePermission.permissions.includes(permissionDef.key)}
                              onCheckedChange={(value) => 
                                handlePermissionChange(rolePermission.role, permissionDef.key, value)
                              }
                              disabled={isLoading}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Grant all permissions to admin
                const allPermissions = permissionDefinitions.map(p => p.key).filter(p => p !== 'canManageEverything');
                setRolePermissions(prev => prev.map(rolePermission => 
                  rolePermission.role === 'admin' 
                    ? {
                        ...rolePermission,
                        permissions: allPermissions
                      }
                    : rolePermission
                ));
                toast({
                  title: "Permissões atualizadas",
                  description: "Todas as permissões foram concedidas ao Administrador"
                });
              }}
              disabled={isLoading}
            >
              Conceder Tudo ao Admin
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Remove all permissions from usuario
                setRolePermissions(prev => prev.map(rolePermission => 
                  rolePermission.role === 'usuario' 
                    ? {
                        ...rolePermission,
                        permissions: ['canViewOwnProfile', 'canAccessSchedule']
                      }
                    : rolePermission
                ));
                toast({
                  title: "Permissões atualizadas", 
                  description: "Permissões básicas foram definidas para o Usuário"
                });
              }}
              disabled={isLoading}
            >
              Resetar Usuário
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSavePermissions} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
