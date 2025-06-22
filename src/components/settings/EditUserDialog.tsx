
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  department: z.string().optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()),
  status: z.enum(['active', 'inactive'])
});

// Use the inferred type from Zod schema
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

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

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'usuario',
      department: '',
      phone: '',
      permissions: [],
      status: 'active'
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
        permissions: user.permissions,
        status: user.status
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert form data to UpdateSystemUserData
      const userData: UpdateSystemUserData = {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phone: data.phone,
        permissions: data.permissions,
        status: data.status
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
