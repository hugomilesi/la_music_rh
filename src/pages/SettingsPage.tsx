import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Shield, Users, Settings, FileText, Plus, Edit, Trash2, Loader2, Lock } from 'lucide-react';
import { SystemUsersDialog } from '@/components/settings/SystemUsersDialog';
import { PermissionsDialog } from '@/components/settings/PermissionsDialog';
import { RolesDialog } from '@/components/settings/RolesDialog';
import { DataExportDialog } from '@/components/settings/DataExportDialog';
import { AddUserDialog } from '@/components/settings/AddUserDialog';
import { EditUserDialog } from '@/components/settings/EditUserDialog';
import { DeleteUserDialog } from '@/components/settings/DeleteUserDialog';



import { SystemUser, CreateSystemUserData, UpdateSystemUserData } from '@/types/systemUser';
import { 
  fetchSystemUsers, 
  fetchRolesData, 
  fetchSystemStats, 
  deleteSystemUser, 
  updateSystemUser,
  listAllSystemUsers,
  RoleData,
  SystemStats 
} from '@/services/settingsService';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/hooks/use-toast';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, canAccessSettings } = usePermissions();
  
  // State for real data
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [rolesData, setRolesData] = useState<RoleData[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalEmployees: 0,
    totalUsers: 0,
    activeUnits: 0,
    lastBackup: 'Carregando...'
  });
  const [syncStats, setSyncStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allUsersData, rolesDataResult, statsData] = await Promise.all([
        listAllSystemUsers(),
        fetchRolesData(),
        fetchSystemStats()
      ]);
      
      // Extract users and sync stats from the new function
      if (allUsersData && allUsersData.success) {
        // Transform the data to match SystemUser interface
        const transformedUsers = (allUsersData.users || []).map((user: any) => {
           const userData = user.user_data;
           // For users without profile, determine status based on sync_status
           let userStatus = 'inactive';
           if (userData) {
             userStatus = userData.status === 'ativo' ? 'active' : 'inactive';
           } else if (user.sync_status && !user.sync_status.user_deleted) {
             // User exists in auth but no profile - consider as active auth user
             userStatus = 'active';
           }
           
           return {
             id: user.id, // This is the auth_user_id
             auth_user_id: user.id, // Store auth_user_id explicitly
             name: userData?.full_name || user.email || 'Usuário sem nome',
             email: user.email,
             role: userData?.role || 'usuario',
             position: userData?.position || 'Não informado',
             department: userData?.department || 'Não informado',
             phone: userData?.phone || 'Não informado',
             status: userStatus,
             lastAccess: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca acessou',
             createdAt: new Date(user.created_at).toLocaleDateString('pt-BR'),
             permissions: [], // Permissions now managed by role_permissions table
             hasProfile: !!userData
           };
         });
        setSystemUsers(transformedUsers);
        setSyncStats(allUsersData.statistics);
        
        // Update system stats with sync data - count only users with profiles
        const usersWithProfiles = transformedUsers.filter(user => user.hasProfile);
        setSystemStats({
          totalEmployees: usersWithProfiles.length,
          totalUsers: usersWithProfiles.length,
          activeUnits: statsData.activeUnits,
          lastBackup: statsData.lastBackup
        });
      } else {
        // Fallback to old method if new function fails
        const usersData = await fetchSystemUsers();
        setSystemUsers(usersData);
        setSystemStats(statsData);
      }
      
      setRolesData(rolesDataResult);
    } catch (err) {
      console.error('Error loading settings data:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: CreateSystemUserData) => {
    try {
      // Reload the data to get the updated user list
      await loadAllData();
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Erro ao adicionar usuário.');
    }
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (id: string, userData: UpdateSystemUserData) => {
    try {
      await updateSystemUser(id, userData);
      await loadAllData();
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar as informações do usuário.",
      });
      setError('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = (user: SystemUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = async (user: SystemUser) => {
    try {
      if (!user.auth_user_id) {
        throw new Error('Usuário não encontrado ou ID de autenticação inválido');
      }
      
      // Use the auth_user_id for deletion
      await deleteSystemUser(user.auth_user_id);
      await loadAllData();
      toast({
        title: "Usuário excluído",
        description: "O usuário foi removido com sucesso do sistema.",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'Erro desconhecido ao excluir usuário.';
      let errorTitle = 'Erro na exclusão';
      
      if (error?.message) {
        if (error.message.includes('Failed to find user profile')) {
          errorTitle = 'Usuário não encontrado';
          errorMessage = 'O usuário selecionado não foi encontrado no sistema.';
        } else if (error.message.includes('Failed to delete user profile')) {
          errorTitle = 'Erro no perfil';
          errorMessage = 'Não foi possível remover o perfil do usuário.';
        } else if (error.message.includes('auth user deletion failed')) {
          errorTitle = 'Erro na autenticação';
          errorMessage = 'O perfil foi removido, mas houve erro na exclusão da autenticação.';
        } else if (error.message.includes('Internal server error')) {
          errorTitle = 'Erro interno';
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
      });
      
      setError(errorMessage);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'admin': 'bg-red-100 text-red-800',
      'coordenador': 'bg-blue-100 text-blue-800',
      'gerente': 'bg-purple-100 text-purple-800',
      'usuario': 'bg-gray-100 text-gray-800'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  // Removed getPermissionsFromRole function - permissions now managed by role_permissions table

  // Check permissions first
  if (!canAccessSettings) {
    return (
      <Dialog open={true} onOpenChange={() => navigate(-1)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar as configurações do sistema.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Entre em contato com o administrador para solicitar acesso.
            </p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">

      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Painel administrativo e configurações do sistema</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Backup de Dados
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Log de Ações
          </Button>
        </div>
      </div>

      {/* Quick Actions - Now Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SystemUsersDialog>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium">Usuários do Sistema</h3>
              <p className="text-sm text-gray-600">Gerenciar acessos</p>
            </CardContent>
          </Card>
        </SystemUsersDialog>

        <PermissionsDialog>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium">Permissões</h3>
              <p className="text-sm text-gray-600">Controlar acessos</p>
            </CardContent>
          </Card>
        </PermissionsDialog>

        <RolesDialog>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium">Cargos e Setores</h3>
              <p className="text-sm text-gray-600">Estrutura organizacional</p>
            </CardContent>
          </Card>
        </RolesDialog>

        <DataExportDialog>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-medium">Exportar Dados</h3>
              <p className="text-sm text-gray-600">Relatórios e backups</p>
            </CardContent>
          </Card>
        </DataExportDialog>
      </div>

      {/* Usuários e Colaboradores Unificados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários e Colaboradores</CardTitle>
            {permissions.canCreateUsers && (
              <AddUserDialog onUserAdd={handleAddUser}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </AddUserDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Carregando usuários...</p>
                  </TableCell>
                </TableRow>
              ) : systemUsers.filter(user => user.hasProfile).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                systemUsers
                  .filter(user => user.hasProfile) // Only show users with valid profiles
                  .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.position || 'Não informado'}</TableCell>
                    <TableCell>{user.department || 'Não informado'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAllData}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Roles and Departments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cargos Cadastrados</CardTitle>
            <RolesDialog>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cargo
              </Button>
            </RolesDialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Colaboradores</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Carregando cargos...</p>
                  </TableCell>
                </TableRow>
              ) : rolesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-gray-500">Nenhum cargo encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                rolesData.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.department}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {role.employees} pessoas
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RolesDialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </RolesDialog>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Synchronization Status */}
      {syncStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status de Sincronização das Tabelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Usuários de Autenticação</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total auth.users:</span>
                  <span className="font-medium">{syncStats.totalAuthUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Órfãos (sem perfil):</span>
                  <span className={`font-medium ${
                    syncStats.orphanedAuthUsers > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {syncStats.orphanedAuthUsers}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Perfis de Usuário</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total profiles:</span>
                  <span className="font-medium">{syncStats.totalProfiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sem funcionário:</span>
                  <span className={`font-medium ${
                    syncStats.usersWithoutEmployee > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {syncStats.usersWithoutEmployee}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Funcionários</h4>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total employees:</span>
                  <span className="font-medium">{syncStats.totalEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={syncStats.orphanedAuthUsers === 0 && syncStats.usersWithoutEmployee === 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }>
                    {syncStats.orphanedAuthUsers === 0 && syncStats.usersWithoutEmployee === 0 
                      ? 'Sincronizado' 
                      : 'Requer atenção'
                    }
                  </Badge>
                </div>
              </div>
            </div>
            
            {(syncStats.orphanedAuthUsers > 0 || syncStats.usersWithoutEmployee > 0) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Existem inconsistências na sincronização das tabelas. 
                  {syncStats.orphanedAuthUsers > 0 && `${syncStats.orphanedAuthUsers} usuários de autenticação sem perfil. `}
                  {syncStats.usersWithoutEmployee > 0 && `${syncStats.usersWithoutEmployee} perfis sem registro de funcionário.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}



      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUserUpdate={handleUpdateUser}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={deletingUser}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onUserDelete={handleConfirmDeleteUser}
      />
    </div>
  );
};

export default SettingsPage;
