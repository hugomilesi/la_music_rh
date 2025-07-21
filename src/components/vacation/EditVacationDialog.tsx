import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VacationRequest } from '@/types/vacation';
import { useVacation } from '@/contexts/VacationContext';
import { differenceInDays, format } from 'date-fns';

const formSchema = z.object({
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de fim é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  type: z.enum(['vacation', 'medical', 'personal', 'maternity', 'paternity']),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endDate'],
});

type FormData = z.infer<typeof formSchema>;

interface EditVacationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: VacationRequest | null;
}

export const EditVacationDialog: React.FC<EditVacationDialogProps> = ({
  open,
  onOpenChange,
  request,
}) => {
  const { updateVacationRequest } = useVacation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      reason: '',
      type: 'vacation',
    },
  });

  // Update form when request changes
  useEffect(() => {
    if (request) {
      form.reset({
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        type: request.type,
      });
    }
  }, [request, form]);

  const onSubmit = async (data: FormData) => {
    if (!request) return;
    
    try {
      setIsSubmitting(true);
      
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const days = differenceInDays(endDate, startDate) + 1;

      await updateVacationRequest(request.id, {
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        type: data.type,
        days,
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error updating vacation request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const typeOptions = [
    { value: 'vacation', label: 'Férias' },
    { value: 'medical', label: 'Licença Médica' },
    { value: 'personal', label: 'Licença Pessoal' },
    { value: 'maternity', label: 'Licença Maternidade' },
    { value: 'paternity', label: 'Licença Paternidade' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Editar Solicitação de Férias - {request?.employeeName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o motivo da solicitação..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};