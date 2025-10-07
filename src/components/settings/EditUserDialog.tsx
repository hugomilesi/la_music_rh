
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
  console.log('EditUserDialog - Component rendered with open:', open, 'user:', user);
  
  const { toast } = useToast();
  const { permissions, isSuperAdmin, canEditInModule } = usePermissionsV2();
  const [isLoading, setIsLoading] = useState(false);
  const canCreateUsers = isSuperAdmin || (permissions && permissions.some(p => p.module === 'usuarios' && p.can_edit));

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'usuario',
      phone: '',
      unit: '',
      status: 'ativo'
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role || 'gestor_rh', // Definir valor padrão para role
        phone: user.phone || '',
        unit: user.unit || '',
        status: user.status
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    console.log('🚀 EditUserDialog onSubmit INICIADO');
    console.log('📝 Dados do formulário:', data);
    console.log('👤 Usuário sendo editado:', user);
    
    if (isLoading) {
      console.log('⚠️ Já está carregando, ignorando submissão');
      return;
    }

    setIsLoading(true);
    console.log('⏳ Estado de loading definido como true');

    try {
      console.log('🔍 Verificando permissões...');
      const canEditUser = canEditInModule('usuarios');
      console.log('✅ Pode editar usuário:', canEditUser);
      
      if (!canEditUser) {
        console.log('❌ Sem permissão para editar usuário');
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para editar usuários com este cargo.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔄 Simulando chamada de API para atualização...');
      // Simular chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Simulação de API concluída');

      console.log('🎉 Usuário editado com sucesso (simulado)');
      toast({
        title: "Usuário atualizado com sucesso!",
        description: `Usuário ${data.name} foi atualizado.`,
      });

      console.log('📞 Chamando onUserUpdate...');
      onUserUpdate(user.id, data);
      console.log('🚪 Fechando diálogo...');
      onOpenChange(false);
    } catch (error) {
      console.error('💥 Exceção no onSubmit:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Finalizando onSubmit, definindo loading como false');
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
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={(e) => {
                console.log('🔘 Botão Salvar Alterações clicado');
                console.log('📋 Dados do formulário:', form.getValues());
                console.log('❌ Erros do formulário:', form.formState.errors);
                console.log('✅ Formulário válido:', form.formState.isValid);
                
                // Não prevenir o evento padrão para permitir o submit normal
                // e.preventDefault();
                // form.handleSubmit(onSubmit)(e);
              }}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
