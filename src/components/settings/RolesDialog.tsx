
import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, Building, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface Role {
  id: number;
  name: string;
  department: string;
  employees: number;
  description?: string;
}

const mockRoles: Role[] = [
  { id: 1, name: 'Professor', department: 'Educação Musical', employees: 45, description: 'Responsável pelo ensino musical' },
  { id: 2, name: 'Coordenador', department: 'Coordenação', employees: 8, description: 'Coordenação pedagógica e administrativa' },
  { id: 3, name: 'Recepcionista', department: 'Atendimento', employees: 12, description: 'Atendimento ao público' },
  { id: 4, name: 'Professor de Canto', department: 'Educação Musical', employees: 3, description: 'Especialista em técnica vocal' }
];

interface RolesDialogProps {
  children: React.ReactNode;
}

export const RolesDialog: React.FC<RolesDialogProps> = ({ children }) => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    department: '',
    description: ''
  });
  const { toast } = useToast();
  const { canAccessSettings } = usePermissions();

  // Check if user has permission to manage roles
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
              Você não tem permissão para gerenciar cargos e setores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRole = () => {
    if (!newRole.name || !newRole.department) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const role: Role = {
      id: Date.now(),
      name: newRole.name,
      department: newRole.department,
      employees: 0,
      description: newRole.description
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', department: '', description: '' });
    setIsAddingRole(false);
    toast({
      title: "Sucesso",
      description: "Cargo adicionado com sucesso"
    });
  };

  const handleDeleteRole = (id: number) => {
    const role = roles.find(r => r.id === id);
    if (role && role.employees > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir um cargo que possui colaboradores",
        variant: "destructive"
      });
      return;
    }

    setRoles(roles.filter(role => role.id !== id));
    toast({
      title: "Sucesso",
      description: "Cargo removido com sucesso"
    });
  };

  const departments = [...new Set(roles.map(role => role.department))];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Cargos e Setores</DialogTitle>
          <DialogDescription>
            Configure a estrutura organizacional da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Add Role */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cargos ou setores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddingRole(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cargo
            </Button>
          </div>

          {/* Department Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptRoles = roles.filter(role => role.department === dept);
              const totalEmployees = deptRoles.reduce((sum, role) => sum + role.employees, 0);
              
              return (
                <div key={dept} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4" />
                    <h3 className="font-medium">{dept}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{deptRoles.length} cargos</p>
                  <p className="text-sm text-gray-600">{totalEmployees} colaboradores</p>
                </div>
              );
            })}
          </div>

          {/* Add Role Form */}
          {isAddingRole && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <h3 className="font-medium">Adicionar Novo Cargo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roleName">Nome do Cargo</Label>
                  <Input
                    id="roleName"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder="Ex: Professor de Piano"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Setor</Label>
                  <Input
                    id="department"
                    value={newRole.department}
                    onChange={(e) => setNewRole({...newRole, department: e.target.value})}
                    placeholder="Ex: Educação Musical"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Descrição das responsabilidades"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddRole}>Adicionar</Button>
                <Button variant="outline" onClick={() => setIsAddingRole(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Roles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role.department}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {role.description || '-'}
                    </TableCell>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
