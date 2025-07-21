import React, { useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lock } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { NewVacationRequest } from '@/types/vacation';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Selecione um colaborador'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  type: z.enum(['vacation', 'medical', 'personal', 'maternity', 'paternity'], {
    required_error: 'Tipo de solicitação é obrigatório'
  }),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"],
});

type FormData = z.infer<typeof formSchema>;

interface NewVacationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewVacationDialog: React.FC<NewVacationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addVacationRequest, isLoading } = useVacation();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { checkPermission } = usePermissions();
  const canManageEmployees = checkPermission('canManageEmployees', false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      type: 'vacation',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Submitting vacation request:', data);
      const vacationData: NewVacationRequest = {
        employeeId: data.employeeId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        type: data.type,
      };
      
      addVacationRequest(vacationData);
      toast({
        title: 'Solicitação criada',
        description: 'A solicitação de férias foi criada com sucesso.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating vacation request:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a solicitação.',
        variant: 'destructive',
      });
    }
  };

  const vacationTypes = [
    { value: 'vacation', label: 'Férias' },
    { value: 'medical', label: 'Licença Médica' },
    { value: 'personal', label: 'Licença Pessoal' },
    { value: 'maternity', label: 'Licença Maternidade' },
    { value: 'paternity', label: 'Licença Paternidade' },
  ];

  // Add error boundary for employee data
  if (!employees || employees.length === 0) {
    console.log('No employees available for vacation dialog');
  }

  if (!canManageEmployees) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para criar solicitações de férias. Esta ação é restrita a administradores.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Férias</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova solicitação de férias.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colaborador</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um colaborador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees && employees.length > 0 ? (
                        employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-employees" disabled>
                          Nenhum colaborador disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Solicitação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vacationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Fim</FormLabel>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o motivo da solicitação"
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isLoading ? 'Criando...' : 'Criar Solicitação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
