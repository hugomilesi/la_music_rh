
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
import { Badge } from '@/components/ui/badge';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NewEvaluationData } from '@/types/evaluation';
import { Coffee, X, Plus } from 'lucide-react';
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
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  meetingDate: z.string().min(1, 'Data é obrigatória'),
  period: z.string().min(1, 'Período é obrigatório'),
  meetingTime: z.string().min(1, 'Horário é obrigatório'),
  location: z.string().min(1, 'Local é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  topics: z.array(z.string()).optional(),
  followUpActions: z.string().optional(),
  confidential: z.boolean().optional(),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CoffeeConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CoffeeConnectionDialog: React.FC<CoffeeConnectionDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { addEvaluation, isLoading } = useEvaluations();
  const { colaboradoresAtivos } = useColaboradores();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [customTopic, setCustomTopic] = React.useState('');
  const [suggestedTopics] = React.useState<string[]>([
    'Desenvolvimento de carreira',
    'Satisfação no trabalho',
    'Desafios atuais',
    'Objetivos pessoais',
    'Feedback sobre liderança',
    'Ambiente de trabalho',
    'Ideias de melhoria',
    'Reconhecimento'
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      meetingDate: '',
      period: '',
      meetingTime: '',
      location: '',
      unit: '',
      topics: [],
      followUpActions: '',
      confidential: false,
      comments: '',
    },
  });

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      
      // Validar dados obrigatórios
      if (!data.employeeId) {
        throw new Error('Colaborador é obrigatório');
      }
      if (!profile?.id && !profile?.profile_id) {
        throw new Error('Usuário não autenticado');
      }
      
      const evaluationData: NewEvaluationData = {
        employee_id: data.employeeId,
        evaluation_type: 'Coffee Connection',
        evaluation_date: data.meetingDate,
        period: data.period,
        evaluator_id: null, // Coffee Connection não requer evaluator_id específico
        comments: data.comments || '',
        unit: data.unit,
        meetingDate: data.meetingDate,
        meetingTime: data.meetingTime,
        location: data.location,
        topics: selectedTopics,
        followUpActions: data.followUpActions || '',
        confidential: data.confidential || false,
      };
      
      
      await addEvaluation(evaluationData);
      
      // Se chegou até aqui, a criação foi bem-sucedida
      toast({
        title: 'Coffee Connection agendado',
        description: 'A sessão foi agendada e notificações serão enviadas.',
      });
      form.reset();
      setSelectedTopics([]);
      onOpenChange(false);
      
      // Call the success callback to refresh the page
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao agendar Coffee Connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao agendar a sessão.';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            Agendar Coffee Connection
          </DialogTitle>
          <DialogDescription>
            Agende uma conversa estruturada para feedback e desenvolvimento.
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Café Central, Sala de reuniões..." {...field} />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                name="meetingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
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
                name="meetingTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div>
              <FormLabel>Tópicos para Discussão</FormLabel>
              <div className="mt-2 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {suggestedTopics.map((topic) => (
                    <label key={topic} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic)}
                        onChange={() => handleTopicToggle(topic)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-700">{topic}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tópico personalizado..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTopic())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomTopic}
                    disabled={!customTopic.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedTopics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Tópicos selecionados:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTopics.map((topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-amber-100 text-amber-800"
                        >
                          {topic}
                          <button
                            type="button"
                            onClick={() => handleTopicToggle(topic)}
                            className="ml-1 hover:text-amber-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="followUpActions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ações de Acompanhamento (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Descreva ações ou próximos passos..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (Opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Contexto adicional ou observações..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="confidential"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="text-sm">Sessão confidencial</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                style={{ backgroundColor: '#B45309' }}
                className="hover:opacity-90 text-white"
              >
                {isLoading ? 'Agendando...' : 'Agendar Coffee Connection'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
