
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock } from 'lucide-react';
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { Colaborador, UnidadeColaborador } from '@/types/colaborador';
import { UNITS } from '@/types/unit';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  position: z.string().min(2, 'Cargo é obrigatório'),
  department: z.string().min(2, 'Departamento é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  units: z.array(z.nativeEnum(UnidadeColaborador)).min(1, 'Selecione pelo menos uma unidade'),
});

type FormData = z.infer<typeof formSchema>;

interface EditEmployeeDialogProps {
  employee: Colaborador | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  employee,
  open,
  onOpenChange,
}) => {
  const { updateColaborador } = useColaboradores();
  const { toast } = useToast();
  const { canEditInModule } = usePermissionsV2();
  
  // Move useForm to top level - before any conditional returns
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      start_date: '',
      units: [],
    },
  });
  
  // Verificar se o usuário tem permissão para gerenciar colaboradores
  const canManageEmployees = useMemo(() => canEditInModule('usuarios'), [canEditInModule]);

  // Update form when employee changes - must be before any conditional returns
  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.nome,
        email: employee.email,
        phone: employee.telefone,
        position: employee.cargo,
        department: employee.departamento,
        start_date: employee.dataAdmissao,
        units: [employee.unidade],
      });
    }
  }, [employee, form]);

  if (!canManageEmployees) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para editar informações de colaboradores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!employee) return;

    try {
      await updateColaborador(employee.id, {
        nome: data.name,
        email: data.email,
        telefone: data.phone,
        cargo: data.position,
        departamento: data.department,
        dataAdmissao: data.start_date,
        unidade: data.units[0],
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the context
      // Log desabilitado: Error updating employee
    }
  };

  if (!employee) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Colaborador</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Nenhum colaborador selecionado.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
          <DialogDescription>
            Atualize as informações de {employee.name}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
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
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Digite o e-mail" {...field} />
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

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o cargo" {...field} />
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
                      <Input placeholder="Digite o departamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="units"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Unidades</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Selecione as unidades onde o colaborador trabalha
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {UNITS.map((unit) => (
                      <FormField
                        key={unit.id}
                        control={form.control}
                        name="units"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={unit.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(unit.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, unit.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== unit.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${unit.color}`}></div>
                                <FormLabel className="font-normal">
                                  {unit.name}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
