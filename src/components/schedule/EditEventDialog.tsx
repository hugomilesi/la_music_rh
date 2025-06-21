
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar as CalendarIcon, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useToast } from '@/hooks/use-toast';
import { ScheduleEvent } from '@/types/schedule';

const editEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  date: z.date({ required_error: 'Data é obrigatória' }),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de fim é obrigatório'),
  type: z.enum(['plantao', 'avaliacao', 'reuniao', 'folga', 'outro']),
  description: z.string().optional(),
  location: z.string().optional(),
  emailAlert: z.boolean().default(false),
  whatsappAlert: z.boolean().default(false),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

interface EditEventDialogProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const { updateEvent, isLoading } = useSchedule();
  const { toast } = useToast();

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: '',
      employeeId: '',
      unit: '',
      startTime: '',
      endTime: '',
      type: 'outro',
      description: '',
      location: '',
      emailAlert: false,
      whatsappAlert: false,
    },
  });

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        employeeId: event.employeeId,
        unit: event.unit,
        date: new Date(event.date),
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.type,
        description: event.description || '',
        location: event.location || '',
        emailAlert: event.emailAlert,
        whatsappAlert: event.whatsappAlert,
      });
    }
  }, [event, form]);

  const onSubmit = (data: EditEventFormData) => {
    if (!event) return;

    const updatedData: Partial<ScheduleEvent> = {
      title: data.title,
      employeeId: data.employeeId,
      unit: data.unit,
      date: format(data.date, 'yyyy-MM-dd'),
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      description: data.description || undefined,
      location: data.location || undefined,
      emailAlert: data.emailAlert,
      whatsappAlert: data.whatsappAlert,
    };

    updateEvent(event.id, updatedData);
    
    toast({
      title: 'Evento atualizado',
      description: 'As alterações foram salvas com sucesso.',
    });

    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const eventTypes = [
    { value: 'plantao', label: 'Plantão' },
    { value: 'avaliacao', label: 'Avaliação' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'folga', label: 'Folga' },
    { value: 'outro', label: 'Outro' },
  ];

  const units = [
    { value: 'centro', label: 'Centro' },
    { value: 'zona-sul', label: 'Zona Sul' },
    { value: 'norte', label: 'Norte' },
    { value: 'online', label: 'Online' },
  ];

  const employees = [
    { value: '1', label: 'Ana Silva' },
    { value: '2', label: 'Carlos Santos' },
    { value: '3', label: 'Maria Oliveira' },
    { value: '4', label: 'João Costa' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Plantão Manhã" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o colaborador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.value} value={employee.value}>
                            {employee.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypes.map((type) => (
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

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP', { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                    <FormLabel>Local (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sala de reuniões" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes adicionais sobre o evento..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 space-y-3">
                <h4 className="text-sm font-medium">Alertas</h4>
                
                <FormField
                  control={form.control}
                  name="emailAlert"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Alerta por Email</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enviar notificação por email antes do evento
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
                  name="whatsappAlert"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Alerta por WhatsApp</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enviar notificação por WhatsApp antes do evento
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

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
