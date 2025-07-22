
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
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
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'professor' | 'coordenador' | 'usuario';
  department: string;
  phone: string;
  position: string;
  status: 'active' | 'inactive';
  permissions: {
    canManageEmployees: boolean;
    canManagePayroll: boolean;
    canViewReports: boolean;
    canManageSettings: boolean;
    canManageUsers: boolean;
    canManageEvaluations: boolean;
  };
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const { checkPermission } = usePermissions();
  
  // Verificar se o usuário tem permissão para gerenciar usuários
  const canManageUsers = useMemo(() => checkPermission('canManageUsers', false), [checkPermission]);
  
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
  
  const form = useForm<UserFormData>({
    defaultValues: {
      name: '',
      email: '',
      role: 'usuario',
      department: '',
      phone: '',
      position: '',
      status: 'active',
      permissions: {
        canManageEmployees: false,
        canManagePayroll: false,
        canViewReports: false,
        canManageSettings: false,
        canManageUsers: false,
        canManageEvaluations: false
      }
    }
  });

  const onSubmit = (data: UserFormData) => {
    console.log('Criando usuário:', {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      phone: data.phone,
      permissions: data.permissions,
      status: data.status
    });
    
    toast({
      title: "Usuário criado",
      description: "O novo usuário foi criado com sucesso.",
    });
    
    form.reset();
    onOpenChange(false);
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
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: 'admin', label: 'Administrador' },
                          { value: 'professor', label: 'Professor' },
                          { value: 'coordenador', label: 'Coordenador' },
                          { value: 'usuario', label: 'Usuário' },
                        ]}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione o cargo"
                        searchPlaceholder="Buscar cargo..."
                        emptyText="Nenhum cargo encontrado."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pedagógico, Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Professor Senior" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Permissions Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Permissões</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="permissions.canManageEmployees"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gerenciar Funcionários</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Adicionar, editar e remover funcionários
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.canManagePayroll"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gerenciar Folha</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Acesso à folha de pagamento
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.canViewReports"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ver Relatórios</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Visualizar relatórios e estatísticas
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.canManageEvaluations"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Gerenciar Avaliações</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Criar e editar critérios de avaliação
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
