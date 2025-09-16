import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, RefreshCw, Shield, Users, Settings, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useAuth } from '@/contexts/AuthContext';
import { notifyPermissionChange } from '@/utils/redirectUtils';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface RolePermission {
  permission_name: string;
  permission_description: string;
}

const PermissionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { canManagePermissions, loading: permLoading, forceRefreshPermissions } = usePermissionsV2();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  


  // Verificar se o usuário tem permissão para gerenciar permissões
  // canManagePermissions já vem do usePermissions

  // Buscar todas as permissões disponíveis
  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('id, name, description')
        .order('name');
      if (error) throw error;
      setPermissions(data || []);
    } catch (err) {
      // Log desabilitado: Error fetching permissions
      setError('Erro ao carregar permissões');
    }
  };

  // Buscar roles configuráveis (exceto super_admin)
  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('id, name, description')
        .neq('name', 'super_admin')
        .order('name');
      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      // Log desabilitado: Error fetching roles
      setError('Erro ao carregar roles');
    }
  };

  // Buscar permissões de um role específico
  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions!inner(
            id,
            name,
            description
          )
        `)
        .eq('role_id', roleId);
      
      if (error) throw error;
      
      const perms = data?.map(rp => ({
        permission_name: rp.permissions.name,
        permission_description: rp.permissions.description
      })) || [];
      
      setRolePermissions(perms);
      setSelectedPermissions(new Set(data?.map(rp => rp.permission_id) || []));
    } catch (err) {
      // Log desabilitado: Error fetching role permissions
      setError('Erro ao carregar permissões do role');
    }
  };

  // Salvar permissões do role
  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    
    setSaving(true);
    try {
      // Primeiro, remover todas as permissões existentes do role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole);
      
      if (deleteError) throw deleteError;
      
      // Depois, adicionar as novas permissões selecionadas
      if (selectedPermissions.size > 0) {
        const rolePermissionsData = Array.from(selectedPermissions).map(permissionId => ({
          role_id: selectedRole,
          permission_id: permissionId
        }));
        
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(rolePermissionsData);
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Permissões atualizadas com sucesso!',
        variant: 'default'
      });
      
      // Notificar mudança de permissões para invalidar cache e redirecionar
      notifyPermissionChange();
      
      // Forçar atualização das permissões no hook
      await forceRefreshPermissions();
      
      // Recarregar permissões do role
      await fetchRolePermissions(selectedRole);
    } catch (err: any) {
      // Log desabilitado: Error saving permissions
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao salvar permissões',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (!canManagePermissions() && !permLoading) {
        setError('Você não tem permissão para gerenciar permissões');
        setLoading(false);
        return;
      }
      
      if (canManagePermissions()) {
        setLoading(true);
        await Promise.all([fetchPermissions(), fetchRoles()]);
        setLoading(false);
      }
    };
    
    loadData();
  }, [canManagePermissions, permLoading]);

  // Carregar permissões quando um role é selecionado
  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  // Agrupar permissões por módulo
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const module = perm.name.split('.')[0];
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Manipular seleção de permissão
  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // Selecionar/deselecionar todas as permissões de um módulo
  const handleModuleToggle = (moduleName: string, checked: boolean) => {
    const modulePermissions = groupedPermissions[moduleName] || [];
    const newSelected = new Set(selectedPermissions);
    
    modulePermissions.forEach(perm => {
      if (checked) {
        newSelected.add(perm.id);
      } else {
        newSelected.delete(perm.id);
      }
    });
    
    setSelectedPermissions(newSelected);
  };

  // Verificar se todas as permissões de um módulo estão selecionadas
  const isModuleFullySelected = (moduleName: string): boolean => {
    const modulePermissions = groupedPermissions[moduleName] || [];
    return modulePermissions.every(perm => selectedPermissions.has(perm.id));
  };

  // Verificar se algumas permissões de um módulo estão selecionadas
  const isModulePartiallySelected = (moduleName: string): boolean => {
    const modulePermissions = groupedPermissions[moduleName] || [];
    return modulePermissions.some(perm => selectedPermissions.has(perm.id)) && !isModuleFullySelected(moduleName);
  };

  if (permLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!canManagePermissions) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar o gerenciamento de permissões.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
            <p className="text-muted-foreground mt-2">
              Configure as permissões para cada role do sistema
            </p>
          </div>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles">
            <Users className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Settings className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Role</CardTitle>
              <CardDescription>
                Escolha um role para configurar suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedRole && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Permissões do Role: {selectedRole}</CardTitle>
                    <CardDescription>
                      Configure as permissões específicas para este role
                    </CardDescription>
                  </div>
                  <Button onClick={saveRolePermissions} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                  <div key={moduleName} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`module-${moduleName}`}
                        checked={isModuleFullySelected(moduleName)}
                        className={isModulePartiallySelected(moduleName) ? 'data-[state=checked]:bg-orange-500' : ''}
                        onCheckedChange={(checked) => handleModuleToggle(moduleName, checked as boolean)}
                      />
                      <label
                        htmlFor={`module-${moduleName}`}
                        className="text-lg font-semibold cursor-pointer"
                      >
                        {moduleName}
                      </label>
                      <Badge variant="secondary">
                        {modulePermissions.length} permissões
                      </Badge>
                    </div>
                    <div className="ml-6 space-y-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={permission.id}
                            className="text-sm cursor-pointer flex-1"
                          >
                            <span className="font-medium">{permission.name}</span>
                            <span className="text-muted-foreground ml-2">
                              {permission.description}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Permissões</CardTitle>
              <CardDescription>
                Visualize todas as permissões disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                  <div key={moduleName} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{moduleName}</h3>
                      <Badge variant="secondary">
                        {modulePermissions.length} permissões
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {modulePermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="p-3 border rounded-lg bg-muted/50"
                        >
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  );
};

export default PermissionsManagement;