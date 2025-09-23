
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EditUserForm } from './EditUserForm';
import { SystemUser, UpdateSystemUserData } from '@/types/systemUser';
import { updateUserSchema, UpdateUserFormData } from '@/types/userFormSchemas';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { Lock } from 'lucide-react';
import { notifyPermissionChange } from '@/utils/redirectUtils';

interface EditUserDialogProps {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (id: string, user: UpdateSystemUserData) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { canEditInModule, forceRefreshPermissions } = usePermissionsV2();
  const canCreateUsers = canEditInModule('usuarios');

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      role: 'usuario',
      position: '',
      department: '',
      phone: '',
      unit: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        role: user.role,
        position: user.position || '',
        department: user.department || '',
        phone: user.phone || '',
        unit: user.unit || '',
        status: user.status
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user || !canCreateUsers) return;

    console.log('🚀 EditUserDialog onSubmit called with data:', data);
    console.log('👤 Current user:', user);

    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert form data to UpdateSystemUserData
      const userData: UpdateSystemUserData = {
        name: data.name,
        email: user.email, // Keep existing email
        role: data.role,
        position: data.position,
        department: data.department,
        phone: data.phone,
        unit: data.unit,
        status: data.status,
        permissions: []
      };
      
      console.log('📦 Prepared userData for update:', userData);
      console.log('🔑 Using user ID:', user.auth_user_id || String(user.id));
      
      onUserUpdate(user.auth_user_id || String(user.id), userData);
      
      // Invalidate cache and notify permission changes if role changed
      if (data.role !== user.role) {
        console.log('🔄 Role changed, notifying permission changes');
        notifyPermissionChange();
        forceRefreshPermissions();
      }
      
      toast({
        title: "Usuário atualizado com sucesso",
        description: `Dados de ${data.name} foram atualizados`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('💥 Error in EditUserDialog onSubmit:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificação de permissão
  if (!canCreateUsers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para editar usuários.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do usuário {user?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <EditUserForm form={form} />
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
