import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Shield, Users, Settings, FileText, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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
  RoleData,
  SystemStats 
} from '@/services/settingsService';


const SettingsPage: React.FC = () => {
  
  // State for real data
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [rolesData, setRolesData] = useState<RoleData[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalEmployees: 0,
    totalUsers: 0,
    activeUnits: 0,
    lastBackup: 'Carregando...'
  });
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
      const [usersData, rolesDataResult, statsData] = await Promise.all([
        fetchSystemUsers(),
        fetchRolesData(),
        fetchSystemStats()
      ]);
      
      setSystemUsers(usersData);
      setRolesData(rolesDataResult);
      setSystemStats(statsData);
    } catch (err) {
      console.error('Error loading settings data:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: CreateSystemUserData) => {
    try {
      // This would need to be implemented in userManagementService
      // For now, just reload the data
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

  const handleUpdateUser = async (id: number, userData: UpdateSystemUserData) => {
    try {
      await updateSystemUser(id, userData);
      await loadAllData();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Erro ao atualizar usuário.');
    }
  };

  const handleDeleteUser = (user: SystemUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = async (id: number) => {
    try {
      await deleteSystemUser(id);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Erro ao excluir usuário.');
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
            <AddUserDialog onUserAdd={handleAddUser}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </AddUserDialog>
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
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-gray-500">Carregando usuários...</p>
                  </TableCell>
                </TableRow>
              ) : systemUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-gray-500">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                systemUsers.map((user) => (
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

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    systemStats.totalEmployees
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Usuários do Sistema</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    systemStats.totalUsers
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Unidades Ativas</p>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    systemStats.activeUnits
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Último Backup</p>
                <p className="text-sm font-medium">
                  {isLoading ? 'Carregando...' : systemStats.lastBackup}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Versão do Sistema:</span>
                <span className="font-medium">v2.4.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Última Atualização:</span>
                <span className="font-medium">15/03/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de Colaboradores:</span>
                <span className="font-medium">156 pessoas</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Espaço Utilizado:</span>
                <span className="font-medium">2.4 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Último Backup:</span>
                <span className="font-medium">21/03/2024 02:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Unidades Ativas:</span>
                <span className="font-medium">8 unidades</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
