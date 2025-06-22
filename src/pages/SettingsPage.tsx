import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Shield, Users, Settings, FileText } from 'lucide-react';
import { SystemUsersDialog } from '@/components/settings/SystemUsersDialog';
import { PermissionsDialog } from '@/components/settings/PermissionsDialog';
import { RolesDialog } from '@/components/settings/RolesDialog';
import { DataExportDialog } from '@/components/settings/DataExportDialog';

const mockUsers = [
  { id: 1, name: 'Admin Geral', email: 'admin@lamusic.com', role: 'admin', lastAccess: '2024-03-21 10:30' },
  { id: 2, name: 'Aline Cristina Pessanha Faria', email: 'aline.faria@lamusic.com', role: 'coordenador', lastAccess: '2024-03-21 09:15' },
  { id: 3, name: 'Felipe Elias Carvalho', email: 'felipe.carvalho@lamusic.com', role: 'professor', lastAccess: '2024-03-20 16:45' }
];

const mockRoles = [
  { id: 1, name: 'Professor', department: 'Educação Musical', employees: 45 },
  { id: 2, name: 'Coordenador', department: 'Coordenação', employees: 8 },
  { id: 3, name: 'Recepcionista', department: 'Atendimento', employees: 12 },
  { id: 4, name: 'Professor de Canto', department: 'Educação Musical', employees: 3 }
];

const SettingsPage: React.FC = () => {
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
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
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
              {mockUsers.map((user) => (
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
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
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

      {/* Roles and Departments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cargos Cadastrados</CardTitle>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
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
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
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
    </div>
  );
};

export default SettingsPage;
