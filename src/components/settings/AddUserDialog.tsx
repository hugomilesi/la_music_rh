
import React, { useMemo, useState, useEffect } from 'react';
import { CreateSystemUserData } from '@/types/systemUser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { createUserWithAutoPassword } from '@/services/userManagementService';
import { CreateUserFormData, createUserSchema } from '@/types/userFormSchemas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { notifyPermissionChange } from '@/utils/redirectUtils';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdd: (userData: CreateSystemUserData) => void;
  children?: React.ReactNode;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'gestor_rh' | 'gerente';
  phone: string;
  unit?: string;
  status: 'ativo' | 'inativo';
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onUserAdd,
  children
}) => {
  console.log('AddUserDialog - Component rendered with open:', open);
  
  const { toast } = useToast();
  const { canCreateInModule, isSuperAdmin, forceRefreshPermissions } = usePermissionsV2();
  const [isLoading, setIsLoading] = useState(false);
  
  // Move useForm to top level - before any conditional returns
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'gerente',
      phone: '',
      unit: undefined,
      status: 'ativo'
    }
  });
  
  // Verificar se o usuário tem permissão para gerenciar usuários
  const canManageUsers = useMemo(() => canCreateInModule('usuarios'), [canCreateInModule]);
  
  if (!canManageUsers) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para adicionar novos usuários ao sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async (data: CreateUserFormData) => {
    console.log('🚀 AddUserDialog onSubmit INICIADO');
    console.log('📝 Dados do formulário:', data);
    
    if (isLoading) {
      console.log('⚠️ Já está carregando, ignorando submissão');
      return;
    }

    setIsLoading(true);
    console.log('⏳ Estado de loading definido como true');

    try {
      console.log('🔍 Verificando permissões...');
      const canCreateUser = canCreateInModule('usuarios');
      console.log('✅ Pode criar usuário:', canCreateUser);
      
      if (!canCreateUser) {
        console.log('❌ Sem permissão para criar usuário');
        toast({
          title: "Erro de Permissão",
          description: "Você não tem permissão para criar usuários com este cargo.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔄 Chamando createUserWithAutoPassword...');
      const result = await createUserWithAutoPassword(data);
      console.log('✅ Resultado da criação:', result);

      if (result.success) {
        console.log('🎉 Usuário criado com sucesso');
        toast({
          title: "Usuário criado com sucesso!",
          description: `Usuário ${data.name} foi criado. Senha temporária: ${result.temporaryPassword}`,
        });

        console.log('📞 Chamando onUserAdd...');
        onUserAdd(result.user);
        console.log('🔄 Resetando formulário...');
        form.reset();
        console.log('🚪 Fechando diálogo...');
        onOpenChange(false);
      } else {
        console.log('❌ Erro na criação do usuário:', result.error);
        toast({
          title: "Erro ao criar usuário",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Exceção no onSubmit:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao criar o usuário.",
        variant: "destructive",
      });
    } finally {
      console.log('🏁 Finalizando onSubmit, definindo loading como false');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo usuário e configure suas permissões.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil de Acesso</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          ...(isSuperAdmin ? [{ value: 'admin', label: 'Administrador' }] : []),
                          { value: 'gestor_rh', label: 'Gestor de RH' },
                          { value: 'gerente', label: 'Gerente' },
                        ]}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione o perfil de acesso"
                        searchPlaceholder="Buscar perfil..."
                        emptyText="Nenhum perfil encontrado."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: 'campo-grande', label: 'Campo Grande' },
                          { value: 'barra', label: 'Barra' },
                          { value: 'recreio', label: 'Recreio' }
                        ]}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione uma unidade (opcional)"
                        searchPlaceholder="Buscar unidade..."
                        emptyText="Nenhuma unidade encontrada."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nota sobre permissões */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> As permissões são automaticamente definidas com base no perfil do usuário e podem ser gerenciadas na seção de Configurações.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Usuário'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
