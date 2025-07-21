import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Shield, Users, Settings, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { SystemUsersDialog } from '@/components/settings/SystemUsersDialog';
import { PermissionsDialog } from '@/components/settings/PermissionsDialog';
import { RolesDialog } from '@/components/settings/RolesDialog';
import { DataExportDialog } from '@/components/settings/DataExportDialog';
import { AddUserDialog } from '@/components/settings/AddUserDialog';
import { EditUserDialog } from '@/components/settings/EditUserDialog';
import { DeleteUserDialog } from '@/components/settings/DeleteUserDialog';
import { NewEmployeeDialog } from '@/components/employees/NewEmployeeDialog';
import { EditEmployeeDialog } from '@/components/employees/EditEmployeeDialog';
import { SystemUser, CreateSystemUserData, UpdateSystemUserData } from '@/types/systemUser';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Employee } from '@/types/employee';

const mockRoles = [
  { id: 1, name: 'Professor', department: 'Educação Musical', employees: 45 },
  { id: 2, name: 'Coordenador', department: 'Coordenação', employees: 8 },
  { id: 3, name: 'Recepcionista', department: 'Atendimento', employees: 12 },
  { id: 4, name: 'Professor de Canto', department: 'Educação Musical', employees: 3 }
];

const SettingsPage: React.FC = () => {
  const { employees, loadEmployees } = useEmployees();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
    {
      id: 1,
      name: 'Admin Geral',
      email: 'admin@lamusic.com',
      role: 'admin',
      department: 'Administração',
      phone: '(11) 99999-9999',
      status: 'active',
      lastAccess: '2024-03-21 10:30',
      createdAt: '2024-01-15',
      permissions: ['employees', 'documents', 'schedule', 'evaluations', 'settings', 'reports']
    },
    {
      id: 2,
      name: 'Aline Cristina Pessanha Faria',
      email: 'aline.faria@lamusic.com',
      role: 'coordenador',
      department: 'Coordenação',
      phone: '(11) 98888-8888',
      status: 'active',
      lastAccess: '2024-03-21 09:15',
      createdAt: '2024-01-20',
      permissions: ['employees', 'documents', 'schedule', 'evaluations']
    },
    {
      id: 3,
      name: 'Felipe Elias Carvalho',
      email: 'felipe.carvalho@lamusic.com',
      role: 'professor',
      department: 'Educação Musical',
      phone: '(11) 97777-7777',
      status: 'active',
      lastAccess: '2024-03-20 16:45',
      createdAt: '2024-02-01',
      permissions: ['documents', 'schedule']
    }
  ]);

  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddUser = (userData: CreateSystemUserData) => {
    const newUser: SystemUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      phone: userData.phone,
      status: userData.status,
      lastAccess: 'Nunca acessou',
      createdAt: new Date().toISOString().split('T')[0],
      permissions: userData.permissions
    };

    setSystemUsers([...systemUsers, newUser]);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (id: number, userData: UpdateSystemUserData) => {
    setSystemUsers(users => 
      users.map(user => 
        user.id === id 
          ? { ...user, ...userData }
          : user
      )
    );
  };

  const handleDeleteUser = (user: SystemUser) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = (id: number) => {
    setSystemUsers(users => users.filter(user => user.id !== id));
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Tem certeza que deseja excluir o colaborador ${employee.name}?`)) {
      try {
        // Aqui você implementaria a lógica de exclusão
        console.log('Excluindo colaborador:', employee.id);
        await loadEmployees(); // Recarrega a lista
      } catch (error) {
        console.error('Erro ao excluir colaborador:', error);
      }
    }
  };

  const handleEmployeeUpdate = async () => {
    await loadEmployees();
    setIsEditEmployeeDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleEmployeeAdd = async () => {
    await loadEmployees();
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

      {/* System Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários do Sistema</CardTitle>
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
                <TableHead>Perfil</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastAccess}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employees Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colaboradores</CardTitle>
            <NewEmployeeDialog onEmployeeAdd={handleEmployeeAdd}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Colaborador
              </Button>
            </NewEmployeeDialog>
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
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              {mockRoles.map((role) => (
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
              ))}
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

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        employee={editingEmployee}
        open={isEditEmployeeDialogOpen}
        onOpenChange={setIsEditEmployeeDialogOpen}
        onEmployeeUpdate={handleEmployeeUpdate}
      />
    </div>
  );
};

export default SettingsPage;
