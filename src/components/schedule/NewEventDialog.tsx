
import React, { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useUnit } from '@/contexts/UnitContext';
import { useToast } from '@/hooks/use-toast';
import { useScheduleCalendar } from '@/hooks/useScheduleCalendar';
import { NewScheduleEventData } from '@/types/schedule';
import { Unit } from '@/types/unit';
import { ConflictAlert } from './ConflictAlert';
import { EventForm } from './EventForm';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  employeeId: z.string().min(1, 'Colaborador é obrigatório'),
  unit: z.enum(['uti_neonatal', 'uti_pediatrica', 'emergencia_pediatrica', 'internacao', 'ambulatorio'] as const),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  type: z.enum(['plantao', 'avaliacao', 'reuniao', 'folga', 'outro'] as const),
  description: z.string().optional(),
  location: z.string().optional(),
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
  const { selectedUnits } = useUnit();
  const { toast } = useToast();
  const { checkEventConflicts } = useScheduleCalendar();
  const [conflicts, setConflicts] = useState<any[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      employeeId: '',
      unit: selectedUnits[0] || 'uti_neonatal',
      date: preselectedDate ? preselectedDate.toISOString().split('T')[0] : '',
      startTime: '',
      endTime: '',
      type: 'plantao',
      description: '',
      location: '',
      emailAlert: false,
      whatsappAlert: false,
    },
  });

  const watchedValues = form.watch(['employeeId', 'date', 'startTime', 'endTime']);

  React.useEffect(() => {
    const [employeeId, date, startTime, endTime] = watchedValues;
    
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
  }, [watchedValues, checkEventConflicts]);

  React.useEffect(() => {
    if (preselectedDate) {
      form.setValue('date', preselectedDate.toISOString().split('T')[0]);
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
        unit: data.unit,
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

  const activeEmployees = employees.filter(emp => emp.status === 'active');

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
          form={form}
          employees={activeEmployees}
          onSubmit={onSubmit}
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
