
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useToast } from '@/hooks/use-toast';
import { CreateUserForm } from './CreateUserForm';
import { UserCredentialsModal } from './UserCredentialsModal';
import { CreateSystemUserData } from '@/types/systemUser';
import { createUserSchema, CreateUserFormData } from '@/types/userFormSchemas';
import { createUserWithAutoPassword } from '@/services/userManagementService';
import { usePermissions } from '@/hooks/usePermissions';
import { Lock } from 'lucide-react';

interface AddUserDialogProps {
  children: React.ReactNode;
  onUserAdd: (user: CreateSystemUserData) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ children, onUserAdd }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [userCredentials, setUserCredentials] = useState<any>(null);
  const { toast } = useToast();
  const { canCreateUsers } = usePermissions();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'usuario',
      position: '',
      department: '',
      phone: '',
      permissions: [],
      status: 'active'
    }
  });

  const onSubmit = async (data: CreateUserFormData) => {
    // Verificar permissões antes de prosseguir
    if (!canCreateUsers) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Criar usuário com senha automática
      const result = await createUserWithAutoPassword(data);
      
      if (result.success && result.user) {
        // Convert form data to CreateSystemUserData for compatibility
        const userData: CreateSystemUserData = {
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          phone: data.phone,
          permissions: data.permissions,
          status: data.status
        };
        
        onUserAdd(userData);
        
        // Exibir credenciais
        setUserCredentials({
          name: result.user.name,
          email: result.user.email,
          password: result.user.password,
          position: result.user.position,
          department: result.user.department
        });
        
        form.reset();
        setOpen(false);
        setShowCredentials(true);
        
        toast({
          title: "Usuário criado com sucesso",
          description: `${data.name} foi adicionado ao sistema`
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificação de permissão
  if (!canCreateUsers) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para criar novos usuários.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo colaborador no sistema. Uma senha será gerada automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CreateUserForm form={form} />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Criando...' : 'Criar Colaborador'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Credenciais */}
      {userCredentials && (
        <UserCredentialsModal
          isOpen={showCredentials}
          onClose={() => {
            setShowCredentials(false);
            setUserCredentials(null);
          }}
          userCredentials={userCredentials}
        />
      )}
    </>
  );
};
