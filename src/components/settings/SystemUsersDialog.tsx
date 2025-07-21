
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Filter, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemUser, CreateSystemUserData, UpdateSystemUserData, SystemUserFilters } from '@/types/systemUser';
import { AddUserDialog } from './AddUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

const mockUsers: SystemUser[] = [
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
];

interface SystemUsersDialogProps {
  children: React.ReactNode;
}

export const SystemUsersDialog: React.FC<SystemUsersDialogProps> = ({ children }) => {
  const { canAccessSettings } = usePermissions();
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [filters, setFilters] = useState<SystemUserFilters>({
    searchQuery: '',
    role: '',
    department: '',
    status: ''
  });
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesDepartment = !filters.department || user.department === filters.department;
    const matchesStatus = !filters.status || user.status === filters.status;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

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

    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: number, userData: UpdateSystemUserData) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, ...userData }
        : user
    ));
    setEditingUser(null);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    setDeletingUser(null);
  };

  const handleEditClick = (user: SystemUser) => {
    setEditingUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: SystemUser) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
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

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  // Verificação de permissão
  if (!canAccessSettings) {
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
              Você não tem permissão para gerenciar usuários do sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-6">
              Entre em contato com o administrador para solicitar acesso.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Usuários do Sistema</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova usuários do sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtros e Ações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="professor">Professor</option>
                  <option value="usuario">Usuário</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              <AddUserDialog onUserAdd={handleAddUser}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </AddUserDialog>
            </div>

            {/* Tabela de Usuários */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastAccess}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário encontrado com os filtros aplicados
                </div>
              )}
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-600">Total de Usuários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-600">Administradores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.role === 'professor').length}
                </div>
                <div className="text-sm text-gray-600">Professores</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <EditUserDialog
        user={editingUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdate={handleUpdateUser}
      />

      <DeleteUserDialog
        user={deletingUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onUserDelete={handleDeleteUser}
      />
    </>
  );
};
