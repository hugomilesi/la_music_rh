
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Employee } from '@/types/employee';
import { Unit, UNITS } from '@/types/unit';

interface EventFormData {
  title: string;
  employeeId: string;
  unit: Unit;
  date: string;
  startTime: string;
  endTime: string;
  type: 'plantao' | 'avaliacao' | 'reuniao' | 'folga' | 'outro';
  description?: string;
  location?: string;
  emailAlert: boolean;
  whatsappAlert: boolean;
}

interface EventFormProps {
  form: UseFormReturn<EventFormData>;
  employees: Employee[];
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  form,
  employees,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel
}) => {
  const eventTypes = [
    { value: 'plantao', label: 'Plantão' },
    { value: 'avaliacao', label: 'Avaliação' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'folga', label: 'Folga' },
    { value: 'outro', label: 'Outro' }
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do evento" {...field} />
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
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {UNITS.map((unit) => (
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
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
            name="date"
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
                <FormLabel>Horário de Término</FormLabel>
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
                  <Input placeholder="Local do evento" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrição do evento"
                  className="min-h-[80px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Alertas</FormLabel>
          <div className="flex items-center space-x-6">
            <FormField
              control={form.control}
              name="emailAlert"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Alerta por Email</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappAlert"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Alerta por WhatsApp</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
