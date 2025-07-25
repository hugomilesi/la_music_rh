
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

interface Permission {
  id: string;
  module: string;
  description: string;
  icon: React.ComponentType<any>;
  roles: {
    admin: boolean;
    coordenador: boolean;
    professor: boolean;
    usuario: boolean;
  };
}

// Default permissions structure
const defaultPermissions: Permission[] = [
  {
    id: 'employees',
    module: 'Colaboradores',
    description: 'Visualizar e gerenciar colaboradores',
    icon: Users,
    roles: { admin: true, coordenador: true, professor: false, usuario: false }
  },
  {
    id: 'documents',
    module: 'Documentos',
    description: 'Gerenciar documentos e arquivos',
    icon: FileText,
    roles: { admin: true, coordenador: true, professor: true, usuario: false }
  },
  {
    id: 'schedule',
    module: 'Agenda',
    description: 'Gerenciar eventos e compromissos',
    icon: Calendar,
    roles: { admin: true, coordenador: true, professor: true, usuario: true }
  },
  {
    id: 'evaluations',
    module: 'Avaliações',
    description: 'Criar e gerenciar avaliações',
    icon: Award,
    roles: { admin: true, coordenador: true, professor: false, usuario: false }
  },
  {
    id: 'settings',
    module: 'Configurações',
    description: 'Acessar configurações do sistema',
    icon: Settings,
    roles: { admin: true, coordenador: false, professor: false, usuario: false }
  }
];

interface PermissionsDialogProps {
  children: React.ReactNode;
}

export const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permission[]>(defaultPermissions);
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
      // For now, we'll use the default permissions structure
      // In a real implementation, you would fetch from the database
      // const permissionsData = await fetchPermissionsFromDatabase();
      setPermissions(defaultPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Erro ao carregar permissões",
        description: "Não foi possível carregar as permissões. Usando configuração padrão.",
        variant: "destructive"
      });
      setPermissions(defaultPermissions);
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

  const handlePermissionChange = (permissionId: string, role: string, value: boolean) => {
    setPermissions(prev => prev.map(permission => 
      permission.id === permissionId 
        ? {
            ...permission,
            roles: {
              ...permission.roles,
              [role]: value
            }
          }
        : permission
    ));

    toast({
      title: "Permissão atualizada",
      description: `Permissão ${value ? 'concedida' : 'removida'} com sucesso`
    });
  };

  const handleSavePermissions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would save to the database
      // await savePermissionsToDatabase(permissions);
      
      // For now, we'll simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
            <Badge className={getRoleBadge('admin')}>Administrador</Badge>
            <Badge className={getRoleBadge('coordenador')}>Coordenador</Badge>
            <Badge className={getRoleBadge('professor')}>Professor</Badge>
            <Badge className={getRoleBadge('usuario')}>Usuário</Badge>
          </div>

          {/* Permissions Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Admin</TableHead>
                  <TableHead className="text-center">Coordenador</TableHead>
                  <TableHead className="text-center">Professor</TableHead>
                  <TableHead className="text-center">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando permissões...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => {
                    const IconComponent = permission.icon;
                    return (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <span className="font-medium">{permission.module}</span>
                          </div>
                        </TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.roles.admin}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'admin', value)
                            }
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.roles.coordenador}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'coordenador', value)
                            }
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.roles.professor}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'professor', value)
                            }
                            disabled={isLoading}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={permission.roles.usuario}
                            onCheckedChange={(value) => 
                              handlePermissionChange(permission.id, 'usuario', value)
                            }
                            disabled={isLoading}
                          />
                        </TableCell>
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
                setPermissions(prev => prev.map(p => ({
                  ...p,
                  roles: { ...p.roles, admin: true }
                })));
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
                setPermissions(prev => prev.map(p => ({
                  ...p,
                  roles: { ...p.roles, usuario: false }
                })));
                toast({
                  title: "Permissões atualizadas", 
                  description: "Todas as permissões foram removidas do Usuário"
                });
              }}
              disabled={isLoading}
            >
              Remover Tudo do Usuário
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
