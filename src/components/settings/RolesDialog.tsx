
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Search, Building, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import {
  fetchRoles,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  countEmployeesByRole,
  type RoleWithDepartment,
  type Department
} from '@/services/rolesService';

interface RolesDialogProps {
  children: React.ReactNode;
}

export const RolesDialog: React.FC<RolesDialogProps> = ({ children }) => {
  const [roles, setRoles] = useState<RoleWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [employeeCounts, setEmployeeCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithDepartment | null>(null);

  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  });
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    department_id: ''
  });
  const { toast } = useToast();
  const { canViewModule } = usePermissionsV2();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [rolesData, departmentsData] = await Promise.all([
          fetchRoles(),
          fetchDepartments()
        ]);
        
        // Add employee count to roles
        const counts: Record<string, number> = {};
        const rolesWithEmployeeCount = await Promise.all(
          rolesData.map(async (role) => {
            const employeeCount = await countEmployeesByRole(role.id);
            counts[role.id] = employeeCount;
            return { ...role, employees: employeeCount };
          })
        );
        
        setRoles(rolesWithEmployeeCount);
        setDepartments(departmentsData);
        setEmployeeCounts(counts);
      } catch (error) {
        // Log desabilitado: Error loading data
        toast({
          title: "Erro ao carregar",
          description: "Ocorreu um erro ao carregar os dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Check if user has permission to manage roles
  if (!canViewModule('configuracoes')) {
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
    role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.department?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setNewDepartment({ name: '', description: '' });
    setIsAddingDepartment(true);
  };





  const handleEditDepartment = async (department: Department) => {
    setEditingDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description || ''
    });
    setIsAddingDepartment(true);
  };



  const handleSaveDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do departamento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, newDepartment);
        toast({
          title: "Sucesso",
          description: "Departamento atualizado com sucesso",
        });
      } else {
        await createDepartment(newDepartment);
        toast({
          title: "Sucesso",
          description: "Departamento criado com sucesso",
        });
      }
      
      setNewDepartment({ name: '', description: '' });
      setIsAddingDepartment(false);
      setEditingDepartment(null);
      await loadData();
    } catch (error) {
      // Log desabilitado: Error saving department
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar departamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setNewRole({ name: '', description: '', department_id: '' });
    setIsAddingRole(true);
  };

  const handleEditRole = async (role: RoleWithDepartment) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      department_id: role.department_id
    });
    setIsAddingRole(true);
  };

  const handleSaveRole = async () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cargo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!newRole.department_id) {
      toast({
        title: "Erro",
        description: "Departamento é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      if (editingRole) {
        await updateRole(editingRole.id, newRole);
        toast({
          title: "Sucesso",
          description: "Cargo atualizado com sucesso",
        });
      } else {
        await createRole(newRole);
        toast({
          title: "Sucesso",
          description: "Cargo criado com sucesso",
        });
      }
      
      setNewRole({ name: '', description: '', department_id: '' });
      setIsAddingRole(false);
      setEditingRole(null);
      await loadData();
    } catch (error) {
      // Log desabilitado: Error saving role
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar cargo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setNewDepartment({ name: '', description: '' });
    setIsAddingDepartment(false);
    setIsAddingRole(false);
    setEditingRole(null);
    setNewRole({ name: '', description: '', department_id: '' });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, departmentsData] = await Promise.all([
        fetchRoles(),
        fetchDepartments()
      ]);
      
      // Count employees for each role
      const counts: Record<string, number> = {};
      const rolesWithCounts = await Promise.all(
        rolesData.map(async (role) => {
          const employeeCount = await countEmployeesByRole(role.id);
          counts[role.id] = employeeCount;
          return { ...role, employees: employeeCount };
        })
      );
      
      setRoles(rolesWithCounts);
      setDepartments(departmentsData);
      setEmployeeCounts(counts);
    } catch (error) {
      // Log desabilitado: Error loading data
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Cargos e Departamentos</DialogTitle>
          <DialogDescription>
            Configure os cargos e departamentos da empresa. Os perfis de acesso (super_admin, admin, gestor_rh, gerente) são gerenciados separadamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Add Role */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cargos ou departamentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAddingDepartment(true)} disabled={isLoading} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </Button>

          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Departamentos</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{roles.length}</div>
              <div className="text-sm text-gray-600">Cargos Ativos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {roles.reduce((sum, role) => sum + (employeeCounts[role.id] || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Funcionários</div>
            </div>
          </div>

          {/* Department Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptRoles = roles.filter(role => role.department?.name === dept.name);
              const totalEmployees = deptRoles.reduce((sum, role) => sum + (employeeCounts[role.id] || 0), 0);
              
              return (
                <div key={dept.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <h3 className="font-medium">{dept.name}</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditDepartment(dept)}
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{deptRoles.length} cargos</p>
                  <p className="text-sm text-gray-600">{totalEmployees} colaboradores</p>
                </div>
              );
            })}
          </div>

          {/* Add Department Form */}
          {isAddingDepartment && (
            <div className="border rounded-lg p-4 space-y-4 bg-blue-50">
              <h3 className="font-medium">Adicionar Novo Departamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deptName">Nome do Departamento</Label>
                  <Input
                    id="deptName"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    placeholder="Ex: Recursos Humanos"
                  />
                </div>
                <div>
                  <Label htmlFor="deptDescription">Descrição (Opcional)</Label>
                  <Input
                    id="deptDescription"
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                    placeholder="Descrição do departamento"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveDepartment} disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingDepartment ? 'Atualizar' : 'Adicionar'} Departamento
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}



          {/* Roles Table */}
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-medium">Cargos</h3>
              <Button onClick={handleAddRole} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cargo
              </Button>
            </div>
            
            {/* Add Role Form */}
            {isAddingRole && (
              <div className="border-b p-4 space-y-4 bg-green-50">
                <h4 className="font-medium">
                  {editingRole ? 'Editar Cargo' : 'Adicionar Novo Cargo'}
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="roleName">Nome do Cargo</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                      placeholder="Ex: Analista de RH"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDepartment">Departamento</Label>
                    <select
                      id="roleDepartment"
                      value={newRole.department_id}
                      onChange={(e) => setNewRole({...newRole, department_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um departamento</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Descrição (Opcional)</Label>
                    <Input
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                      placeholder="Descrição do cargo"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveRole} disabled={isLoading}>
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingRole ? 'Atualizar' : 'Adicionar'} Cargo
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Colaboradores</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Carregando cargos...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum cargo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.department?.name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {role.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {employeeCounts[role.id] || 0} pessoas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditRole(role)}
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
