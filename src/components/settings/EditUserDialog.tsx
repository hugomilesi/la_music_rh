
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
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';

interface EditUserDialogProps {
  user: SystemUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (id: number, user: UpdateSystemUserData) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { canCreateUsers } = usePermissions();

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      role: 'usuario',
      position: '',
      department: '',
      phone: '',
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
        status: user.status
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user || !canCreateUsers) return;

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
        status: data.status,
        permissions: []
      };
      
      onUserUpdate(user.id, userData);
      
      toast({
        title: "Usuário atualizado com sucesso",
        description: `Dados de ${data.name} foram atualizados`
      });

      onOpenChange(false);
    } catch (error) {
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
