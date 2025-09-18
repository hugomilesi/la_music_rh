
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreateUserFormData } from '@/types/userFormSchemas';
import { fetchRoles, fetchDepartments, RoleWithDepartment, Department } from '@/services/rolesService';

interface CreateUserFormProps {
  form: UseFormReturn<CreateUserFormData>;
}

// Permissões removidas - serão gerenciadas pelo card de permissões

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const [roles, setRoles] = useState<RoleWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    const loadRolesAndDepartments = async () => {
      setLoadingRoles(true);
      try {
        const [rolesData, departmentsData] = await Promise.all([
          fetchRoles(),
          fetchDepartments()
        ]);
        setRoles(rolesData);
        setDepartments(departmentsData);
      } catch (error) {
  
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRolesAndDepartments();
  }, []);

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações Básicas</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Digite o nome completo"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="usuario@lamusic.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="department">Setor</Label>
            <select
              id="department"
              {...register('department')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              disabled={loadingRoles}
            >
              <option value="">Selecione um setor</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Informações de Acesso */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Credenciais de Acesso</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">ℹ</span>
            </div>
            <p className="text-sm text-blue-700">
              <strong>Senha automática:</strong> Uma senha segura será gerada automaticamente e exibida após a criação do usuário.
            </p>
          </div>
        </div>
      </div>

      {/* Perfil e Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Perfil e Acesso</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="user-role">Perfil de Usuário *</Label>
            <select
              id="user-role"
              {...register('role')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="gerente">Gerente</option>
              <option value="gestor_rh">Gestor RH</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Cargo *</Label>
            <select
              id="position"
              {...register('position')}
              className={`w-full h-10 px-3 rounded-md border border-input bg-background ${
                errors.position ? 'border-red-500' : ''
              }`}
              disabled={loadingRoles}
            >
              <option value="">Selecione um cargo</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name} - {role.department?.name}
                </option>
              ))}
            </select>
            {errors.position && (
              <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status do Usuário *</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permissões removidas - serão gerenciadas pelo card de permissões */}
    </div>
  );
};
