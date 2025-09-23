
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
import { UserCreatedModal } from './UserCreatedModal';
import { notifyPermissionChange } from '@/utils/redirectUtils';
import { fetchDepartments, fetchRoles, type Department, type Role } from '@/services/rolesService';

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
  department: string;
  phone: string;
  position: string;
  unit?: string;
  status: 'active' | 'inactive';
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  onUserAdd,
  children
}) => {
  const { toast } = useToast();
  const { canCreateInModule, isSuperAdmin, forceRefreshPermissions } = usePermissionsV2();
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<any>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  
  // Fetch departments and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, rolesData] = await Promise.all([
          fetchDepartments(),
          fetchRoles()
        ]);
        setDepartments(departmentsData);
        setRoles(rolesData);
      } catch (error) {
        console.error('Error loading departments and roles:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar departamentos e cargos.",
          variant: "destructive"
        });
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);
  
  // Move useForm to top level - before any conditional returns
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'gerente',
      department: '',
      phone: '',
      position: '',
      status: 'active'
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
    setIsLoading(true);
    
    try {
      // Validação adicional no frontend
      if (!data.name?.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "Nome completo é obrigatório.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (!data.email?.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "Email é obrigatório.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (!data.position?.trim()) {
        toast({
          title: "Campo obrigatório",
          description: "Cargo é obrigatório.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const result = await createUserWithAutoPassword(data);
      
      if (result.success && result.user) {
        // Prepare user data for the credentials modal
        setCreatedUserData({
          name: result.user.name,
          email: result.user.email,
          password: result.user.password,
          position: data.position,
          department: data.department
        });
        
        // Call the parent callback to refresh the user list
        onUserAdd({
          name: result.user.name,
          email: result.user.email,
          role: data.role,
          department: data.department || '',
          position: data.position,
          phone: data.phone || '',
          status: data.status
        });
        
        // Invalidate cache and notify permission changes when new user is created
        notifyPermissionChange();
        forceRefreshPermissions();
        
        form.reset();
        onOpenChange(false);
        setShowCredentialsModal(true);
      } else {
        // Tratamento específico de erros da API
        let errorTitle = "Erro ao criar usuário";
        let errorMessage = result.error || "Ocorreu um erro inesperado.";
        
        // Verificar tipos específicos de erro
        if (result.error) {
          if (result.error.includes('Email já cadastrado no sistema')) {
            errorTitle = "Email já cadastrado";
            errorMessage = "Este email já está sendo usado por outro usuário. Por favor, use um email diferente.";
          } else if (result.error.includes('Por favor, corrija os seguintes campos:')) {
            errorTitle = "Dados inválidos";
            errorMessage = result.error;
          } else if (result.error.includes('Invalid email')) {
            errorTitle = "Email inválido";
            errorMessage = "Por favor, insira um endereço de email válido.";
          } else if (result.error.includes('Password')) {
            errorTitle = "Erro na senha";
            errorMessage = "Erro ao gerar senha temporária. Tente novamente.";
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      // Log desabilitado: Erro ao criar usuário
      
      // Tratamento de erros de rede ou outros erros inesperados
      let errorMessage = "Ocorreu um erro inesperado. Verifique os dados e tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('Email já cadastrado no sistema')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está sendo usado por outro usuário. Por favor, use um email diferente.",
            variant: "destructive"
          });
          return;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        }
      }
      
      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Combobox
                          options={departments.map(dept => ({ value: dept.name, label: dept.name }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um departamento"
                          searchPlaceholder="Buscar departamento..."
                          emptyText="Nenhum departamento encontrado."
                        />
                        {departments.length > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>Departamentos disponíveis:</strong> {departments.map(dept => dept.name).join(', ')}
                          </div>
                        )}
                      </div>
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
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Combobox
                          options={roles.map(role => ({ value: role.name, label: role.name }))}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um cargo"
                          searchPlaceholder="Buscar cargo..."
                          emptyText="Nenhum cargo encontrado."
                        />
                        {roles.length > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            <strong>Cargos disponíveis:</strong> {roles.map(role => role.name).join(', ')}
                          </div>
                        )}
                      </div>
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
    
    {/* Modal de credenciais do usuário criado */}
    {createdUserData && (
      <UserCreatedModal
        open={showCredentialsModal}
        onOpenChange={setShowCredentialsModal}
        userData={createdUserData}
      />
    )}
    </>
  );
};
