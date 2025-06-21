
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
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { NewEvaluationData } from '@/types/evaluation';
import { Coffee, X, Plus } from 'lucide-react';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  meetingDate: z.string().min(1, 'Data é obrigatória'),
  meetingTime: z.string().min(1, 'Horário é obrigatório'),
  location: z.string().min(1, 'Local é obrigatório'),
  topics: z.array(z.string()).optional(),
  followUpActions: z.string().optional(),
  confidential: z.boolean().optional(),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CoffeeConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestedTopics = [
  'Desenvolvimento de carreira',
  'Satisfação no trabalho',
  'Desafios atuais',
  'Objetivos pessoais',
  'Feedback sobre liderança',
  'Ambiente de trabalho',
  'Ideias de melhoria',
  'Reconhecimento'
];

export const CoffeeConnectionDialog: React.FC<CoffeeConnectionDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addEvaluation, isLoading } = useEvaluations();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [customTopic, setCustomTopic] = React.useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      meetingDate: '',
      meetingTime: '',
      location: '',
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
      const evaluationData: NewEvaluationData = {
        employeeId: data.employeeId,
        type: 'Coffee Connection',
        period: new Date().getFullYear().toString(),
        meetingDate: data.meetingDate,
        meetingTime: data.meetingTime,
        location: data.location,
        topics: selectedTopics,
        followUpActions: data.followUpActions,
        confidential: data.confidential,
        comments: data.comments,
      };
      
      addEvaluation(evaluationData);
      toast({
        title: 'Coffee Connection agendado',
        description: 'A sessão foi agendada e notificações serão enviadas.',
      });
      form.reset();
      setSelectedTopics([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao agendar a sessão.',
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
                name="meetingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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

            <div>
              <FormLabel>Tópicos para Discussão</FormLabel>
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((topic) => (
                    <Badge
                      key={topic}
                      variant={selectedTopics.includes(topic) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-amber-100 hover:text-amber-800"
                      onClick={() => handleTopicToggle(topic)}
                    >
                      {topic}
                      {selectedTopics.includes(topic) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
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
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedTopics.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Tópicos selecionados: {selectedTopics.join(', ')}
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
                className="bg-amber-600 hover:bg-amber-700"
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
