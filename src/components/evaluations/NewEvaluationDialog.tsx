import React from 'react';
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
import { useEvaluations } from '@/contexts/EvaluationContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { NewEvaluationData } from '@/types/evaluation';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  type: z.enum(['Avaliação 360°', 'Auto Avaliação', 'Avaliação do Gestor', 'Coffee Connection'], {
    errorMap: () => ({ message: 'Tipo de avaliação é obrigatório' })
  }),
  period: z.string().min(1, 'Período é obrigatório'),
  evaluatorId: z.string().optional(),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewEvaluationDialog: React.FC<NewEvaluationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addEvaluation, isLoading } = useEvaluations();
  const { employees } = useEmployees();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      type: 'Avaliação 360°',
      period: '2024-T1',
      evaluatorId: '',
      comments: '',
    },
  });

  const selectedType = form.watch('type');

  const onSubmit = async (data: FormData) => {
    try {
      const evaluationData: NewEvaluationData = {
        employeeId: data.employeeId,
        type: data.type,
        period: data.period,
        evaluatorId: data.evaluatorId || undefined,
        comments: data.comments || undefined,
      };
      
      addEvaluation(evaluationData);
      toast({
        title: 'Avaliação criada',
        description: 'A nova avaliação foi criada com sucesso.',
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao criar a avaliação.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Avaliação</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova avaliação de desempenho.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione um colaborador</option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Avaliação</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Avaliação 360°">Avaliação 360°</option>
                        <option value="Auto Avaliação">Auto Avaliação</option>
                        <option value="Avaliação do Gestor">Avaliação do Gestor</option>
                        <option value="Coffee Connection">Coffee Connection</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={selectedType === 'Coffee Connection' ? 'Ex: 2024' : 'Ex: 2024-T1'} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              {selectedType !== 'Coffee Connection' && (
                <FormField
                  control={form.control}
                  name="evaluatorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliador (Opcional)</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecione um avaliador</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name} - {employee.position}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {selectedType === 'Coffee Connection' && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  Para Coffee Connection, use o botão "Agendar Sessão" no card específico para configurar data, horário e tópicos.
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentários (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Comentários adicionais sobre a avaliação..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                {isLoading ? 'Criando...' : 'Criar Avaliação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
