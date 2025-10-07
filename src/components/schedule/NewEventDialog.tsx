
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Lock } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { useScheduleCalendar } from '@/hooks/useScheduleCalendar';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { NewScheduleEventData, EventFormData } from '@/types/schedule';
import { ScheduleUnit } from '@/types/unit';
import { ConflictAlert } from './ConflictAlert';
import { EventForm } from './EventForm';
import { formatDateToLocal } from '@/utils/dateUtils';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  unit: z.nativeEnum(ScheduleUnit),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  type: z.enum(['meeting', 'appointment', 'reminder', 'task', 'vacation', 'training'] as const),
  description: z.string().default(''),
  location: z.string().default(''),
  emailAlert: z.boolean().default(false),
  whatsappAlert: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface NewEventDialogProps {
  preselectedDate?: Date | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const NewEventDialog: React.FC<NewEventDialogProps> = ({ 
  preselectedDate, 
  isOpen: controlledIsOpen, 
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addEvent, isLoading } = useSchedule();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { checkEventConflicts } = useScheduleCalendar();
  const { canCreateInModule } = usePermissionsV2();
  const canManageEmployees = useMemo(() => canCreateInModule('agenda'), [canCreateInModule]);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Create form with proper FormData type
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      employeeId: '',
      unit: ScheduleUnit.CAMPO_GRANDE,
      date: preselectedDate ? formatDateToLocal(preselectedDate) : '',
      startTime: '',
      endTime: '',
      type: 'meeting',
      description: '',
      location: '',
      emailAlert: false,
      whatsappAlert: false,
    },
  });

  const employeeId = form.watch('employeeId');
  const date = form.watch('date');
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');

  React.useEffect(() => {
    if (employeeId && date && startTime && endTime) {
      const conflicts = checkEventConflicts({
        employeeId,
        date,
        startTime,
        endTime
      });
      setConflicts(conflicts);
    } else {
      setConflicts([]);
    }
  }, [employeeId, date, startTime, endTime, checkEventConflicts]);

  React.useEffect(() => {
    if (preselectedDate) {
      const dateString = formatDateToLocal(preselectedDate);
      form.setValue('date', dateString);
    }
  }, [preselectedDate, form]);

  const handleOpenChange = (open: boolean) => {
    if (controlledIsOpen !== undefined && onClose) {
      if (!open) onClose();
    } else {
      setIsOpen(open);
    }
  };

  const currentIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

  const onSubmit = async (data: FormData) => {
    try {
      const eventData: NewScheduleEventData = {
        title: data.title,
        employeeId: data.employeeId,
        unit: data.unit as ScheduleUnit,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        description: data.description,
        location: data.location,
        emailAlert: data.emailAlert,
        whatsappAlert: data.whatsappAlert,
      };
      
      if (conflicts.length > 0) {
        toast({
          title: 'Atenção',
          description: 'Existem conflitos de horário. Deseja continuar mesmo assim?',
          variant: 'destructive',
        });
        // Em uma implementação completa, aqui poderia abrir um modal de confirmação
      }

      await addEvent(eventData);
      form.reset();
      setConflicts([]);
      handleOpenChange(false);
      
      toast({
        title: 'Evento criado',
        description: 'O evento foi criado com sucesso.',
      });
    } catch (error) {

      toast({
        title: 'Erro',
        description: 'Erro ao criar evento.',
        variant: 'destructive',
      });
    }
  };

  const activeEmployees = employees.filter(emp => emp.status === 'ativo');

  // Convert FormData to EventFormData for the EventForm component
  const convertToEventFormData = (data: FormData): EventFormData => ({
    title: data.title,
    employeeId: data.employeeId,
    unit: data.unit,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    type: data.type,
    description: data.description,
    location: data.location,
    emailAlert: data.emailAlert,
    whatsappAlert: data.whatsappAlert,
  });

  if (!canManageEmployees) {
    const AccessDeniedDialog = (
      <Dialog open={currentIsOpen} onOpenChange={handleOpenChange}>
        {controlledIsOpen === undefined && (
          <DialogTrigger asChild>
            <Button disabled>
              <Lock className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para criar eventos. Esta ação é restrita a administradores.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => handleOpenChange(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
    return AccessDeniedDialog;
  }

  const DialogComponent = (
    <Dialog open={currentIsOpen} onOpenChange={handleOpenChange}>
      {controlledIsOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
          <DialogDescription>
            Crie um novo evento na agenda. Verifique conflitos de horário antes de salvar.
          </DialogDescription>
        </DialogHeader>

        {conflicts.length > 0 && (
          <ConflictAlert conflicts={conflicts} className="mb-4" />
        )}

        <EventForm
          form={form as any}
          employees={activeEmployees}
          onSubmit={(data) => onSubmit(data as FormData)}
          onCancel={() => handleOpenChange(false)}
          isLoading={isLoading}
          submitLabel="Criar Evento"
        />
      </DialogContent>
    </Dialog>
  );

  return DialogComponent;
};

export default NewEventDialog;

