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
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { useToast } from '@/hooks/use-toast';
import { NewEvaluationData } from '@/types/evaluation';
import { SCHEDULE_UNITS } from '@/types/unit';

// Função para converter data em período (ano e trimestre)
const convertDateToPeriod = (date: string): string => {
  if (!date) return '';
  
  const selectedDate = new Date(date);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1; // getMonth() retorna 0-11
  
  let quarter = '';
  if (month >= 1 && month <= 3) {
    quarter = '1º Trimestre';
  } else if (month >= 4 && month <= 6) {
    quarter = '2º Trimestre';
  } else if (month >= 7 && month <= 9) {
    quarter = '3º Trimestre';
  } else if (month >= 10 && month <= 12) {
    quarter = '4º Trimestre';
  }
  
  return `${year} - ${quarter}`;
};

const formSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  evaluation_type: z.enum(['Avaliação 360°', 'Auto Avaliação', 'Avaliação do Gestor'], {
    errorMap: () => ({ message: 'Tipo de avaliação é obrigatório' })
  }),
  evaluation_date: z.string().min(1, 'Data da avaliação é obrigatória'),
  period: z.string().min(1, 'Período é obrigatório'),
  evaluatorId: z.string().optional(),
  comments: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória'),
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
  const { colaboradoresAtivos } = useColaboradores();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      evaluation_type: 'Avaliação 360°',
      evaluation_date: '',
      period: '',
      evaluatorId: '',
      comments: '',
      unit: '',
    },
  });

  const selectedType = form.watch('evaluation_type');

  const onSubmit = async (data: FormData) => {
    try {
      
      const evaluationData: NewEvaluationData = {
        employee_id: data.employee_id,
        evaluation_type: data.evaluation_type,
        evaluation_date: data.evaluation_date,
        period: data.period,
        evaluator_id: data.evaluatorId || null,
        comments: data.comments || undefined,
        unit: data.unit,
      };
      
      
      await addEvaluation(evaluationData);
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
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione um colaborador</option>
                        {colaboradoresAtivos.map((colaborador) => (
                          <option key={colaborador.id} value={colaborador.id}>
                            {colaborador.nome} - {colaborador.cargo}
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
                name="evaluation_type"
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
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Selecione uma unidade</option>
                        {SCHEDULE_UNITS.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
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
                      name="evaluation_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Avaliação</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                const period = convertDateToPeriod(e.target.value);
                                form.setValue('period', period);
                              }}
                            />
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
                              {...field}
                              readOnly
                              placeholder="Será preenchido automaticamente"
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />



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
                        {colaboradoresAtivos.map((colaborador) => (
                          <option key={colaborador.id} value={colaborador.id}>
                            {colaborador.nome} - {colaborador.cargo}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>



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
