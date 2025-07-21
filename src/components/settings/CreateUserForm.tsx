
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CreateUserFormData } from '@/types/userFormSchemas';

interface CreateUserFormProps {
  form: UseFormReturn<CreateUserFormData>;
}

const departments = [
  'Administração',
  'Coordenação',
  'Educação Musical',
  'Atendimento',
  'Recursos Humanos',
  'Tecnologia'
];

const permissions = [
  { id: 'employees', label: 'Gerenciar Colaboradores' },
  { id: 'documents', label: 'Gerenciar Documentos' },
  { id: 'schedule', label: 'Gerenciar Agenda' },
  { id: 'evaluations', label: 'Gerenciar Avaliações' },
  { id: 'settings', label: 'Configurações do Sistema' },
  { id: 'reports', label: 'Relatórios e Análises' }
];

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ form }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const selectedPermissions = watch('permissions') || [];

  const togglePermission = (permissionId: string) => {
    const current = selectedPermissions;
    const updated = current.includes(permissionId)
      ? current.filter(p => p !== permissionId)
      : [...current, permissionId];
    setValue('permissions', updated);
  };

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
            >
              <option value="">Selecione um setor</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
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
            <Label htmlFor="role">Perfil de Usuário *</Label>
            <select
              id="role"
              {...register('role')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="usuario">Usuário</option>
              <option value="professor">Professor</option>
              <option value="coordenador">Coordenador</option>
              <option value="admin">Administrador</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Cargo *</Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="Ex: Assistente, Coordenador, Professor"
              className={errors.position ? 'border-red-500' : ''}
            />
            {errors.position && (
              <p className="text-sm text-red-500 mt-1">{errors.position.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={watch('status') === 'active'}
              onCheckedChange={(checked) => setValue('status', checked ? 'active' : 'inactive')}
            />
            <Label htmlFor="status">Usuário Ativo</Label>
          </div>
        </div>
      </div>

      {/* Permissões */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Permissões do Sistema</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {permissions.map(permission => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Switch
                id={permission.id}
                checked={selectedPermissions.includes(permission.id)}
                onCheckedChange={() => togglePermission(permission.id)}
              />
              <Label htmlFor={permission.id} className="text-sm">
                {permission.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
