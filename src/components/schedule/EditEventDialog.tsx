import React, { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Calendar as CalendarIcon, Save, X, Lock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useToast } from '@/hooks/use-toast';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { useEmployees } from '@/hooks/useEmployees';
import { ScheduleEvent } from '@/types/schedule';
import { ScheduleUnit, SCHEDULE_UNITS } from '@/types/unit';

const editEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  unit: z.nativeEnum(ScheduleUnit, { required_error: 'Unidade é obrigatória' }),
  date: z.date({ required_error: 'Data é obrigatória' }),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de fim é obrigatório'),
  type: z.enum(['meeting', 'appointment', 'reminder', 'task', 'vacation', 'training']),
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
  const { canEditInModule } = usePermissionsV2();
  const { employees: employeesList, loading: loadingEmployees } = useEmployees();
  const canManageEmployees = useMemo(() => canEditInModule('agenda'), [canEditInModule]);

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: '',
      employeeId: '',
      unit: ScheduleUnit.CAMPO_GRANDE,
      startTime: '',
      endTime: '',
      type: 'appointment',
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
        unit: event.unit as ScheduleUnit,
        date: new Date(event.date),
        startTime: event.startTime,
        endTime: event.endTime,
        type: event.type,
        description: event.description || '',
        location: event.location || '',
        emailAlert: event.emailAlert || false,
        whatsappAlert: event.whatsappAlert || false,
      });
    }
  }, [event, form]);

  const onSubmit = (data: EditEventFormData) => {
    if (!event) return;

    const updatedData: Partial<ScheduleEvent> = {
      title: data.title,
      employeeId: data.employeeId,
      employee_id: data.employeeId, // for database compatibility
      unit: data.unit,
      date: format(data.date, 'yyyy-MM-dd'),
      event_date: format(data.date, 'yyyy-MM-dd'), // for database compatibility
      startTime: data.startTime,
      start_time: data.startTime, // for database compatibility
      endTime: data.endTime,
      end_time: data.endTime, // for database compatibility
      type: data.type,
      description: data.description || undefined,
      location: data.location || undefined,
      emailAlert: data.emailAlert,
      email_alert: data.emailAlert, // for database compatibility
      whatsappAlert: data.whatsappAlert,
      whatsapp_alert: data.whatsappAlert, // for database compatibility
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
    { value: 'meeting', label: 'Reunião' },
    { value: 'appointment', label: 'Compromisso' },
    { value: 'reminder', label: 'Lembrete' },
    { value: 'task', label: 'Tarefa' },
    { value: 'vacation', label: 'Férias' },
    { value: 'training', label: 'Treinamento' },
  ];

  const employees = useMemo(() => {
    return employeesList.map(emp => ({
      value: emp.id,
      label: `${emp.name} - ${emp.position}`
    }));
  }, [employeesList]);

  if (!canManageEmployees) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para editar eventos. Esta ação é restrita a administradores.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>
            Formulário para editar as informações do evento selecionado
          </DialogDescription>
        </DialogHeader>
        
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-teal-500 p-6 text-white">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="150" cy="50" r="30" fill="white" fillOpacity="0.1" />
              <circle cx="180" cy="80" r="20" fill="white" fillOpacity="0.15" />
              <circle cx="120" cy="30" r="15" fill="white" fillOpacity="0.1" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm">
                <Save className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Editar Evento</h2>
                <p className="text-white text-opacity-90 mt-1">Atualize as informações do evento</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-700 font-semibold">Título do Evento</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Plantão Manhã" 
                          className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          {...field} 
                        />
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
                    <FormLabel className="text-gray-700 font-semibold">Colaborador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                          <SelectValue placeholder={loadingEmployees ? "Carregando colaboradores..." : "Selecione o colaborador"} />
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
                    <FormLabel className="text-gray-700 font-semibold">Unidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SCHEDULE_UNITS.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${unit.color}`}></div>
                              {unit.name}
                            </div>
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
                    <FormLabel className="text-gray-700 font-semibold">Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
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
                    <FormLabel className="text-gray-700 font-semibold">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg hover:bg-gray-50',
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
                    <FormLabel className="text-gray-700 font-semibold">Horário de Início</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field} 
                      />
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
                    <FormLabel className="text-gray-700 font-semibold">Horário de Fim</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field} 
                      />
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
                    <FormLabel className="text-gray-700 font-semibold">Local (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Sala de reuniões" 
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field} 
                      />
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
                    <FormLabel className="text-gray-700 font-semibold">Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes adicionais sobre o evento..."
                        className="resize-none bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Alertas
                </h4>
                
                <FormField
                  control={form.control}
                  name="emailAlert"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-gray-700 font-medium">Alerta por Email</FormLabel>
                        <div className="text-sm text-gray-500">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-gray-700 font-medium">Alerta por WhatsApp</FormLabel>
                        <div className="text-sm text-gray-500">
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

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg px-6"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-6 shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
