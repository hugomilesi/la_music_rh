
import React, { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreateUserForm } from './CreateUserForm';
import { CreateSystemUserData } from '@/types/systemUser';

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'coordenador', 'professor', 'usuario']),
  department: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  permissions: z.array(z.string()),
  status: z.enum(['active', 'inactive'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface AddUserDialogProps {
  children: React.ReactNode;
  onUserAdd: (user: CreateSystemUserData) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({ children, onUserAdd }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'usuario',
      department: '',
      phone: '',
      password: '',
      confirmPassword: '',
      permissions: [],
      status: 'active'
    }
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert form data to CreateSystemUserData
      const userData: CreateSystemUserData = {
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        permissions: data.permissions,
        status: data.status
      };
      
      onUserAdd(userData);
      
      toast({
        title: "Usuário criado com sucesso",
        description: `${data.name} foi adicionado ao sistema`
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao criar usuário",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo usuário no sistema
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
              {isLoading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
