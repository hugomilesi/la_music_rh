import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { useForm } from 'react-hook-form';
import { useIncidents } from '@/contexts/IncidentsContext';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';

interface NewIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IncidentFormData {
  employeeId: string;
  type: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  description: string;
  incidentDate: string;
  reporterId: string;
}

export const NewIncidentDialog: React.FC<NewIncidentDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { addIncident } = useIncidents();
  const { toast } = useToast();
  const { employees, loading: loadingEmployees } = useEmployees();
  
  const form = useForm<IncidentFormData>({
    defaultValues: {
      employeeId: '',
      type: '',
      severity: 'baixa',
      description: '',
      incidentDate: new Date().toISOString().split('T')[0],
      reporterId: 'eea4767c-7c68-4667-b783-cba2b30c9fcf' // Default reporter ID
    }
  });

  const onSubmit = (data: IncidentFormData) => {
    const incidentData = {
      employeeId: data.employeeId,
      employeeName: employees.find(emp => emp.id === data.employeeId)?.name || '',
      type: data.type,
      severity: data.severity,
      description: data.description,
      incidentDate: data.incidentDate,
      reporterId: data.reporterId,
      reporterName: employees.find(emp => emp.id === data.reporterId)?.name || '',
      status: 'aberto' as const
    };
    
    addIncident(incidentData);
    
    toast({
      title: "Ocorrência criada",
      description: "A ocorrência foi registrada com sucesso.",
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Ocorrência</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <Combobox
                        options={employees.map((employee) => ({
                          value: employee.id,
                          label: employee.name,
                        }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione um colaborador"
                        searchPlaceholder="Buscar colaborador..."
                        emptyText="Nenhum colaborador encontrado."
                      />
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
                    <FormLabel>Tipo de Ocorrência</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" required>
                        <option value="">Selecione o tipo</option>
                        <option value="Atraso">Atraso</option>
                        <option value="Falta Injustificada">Falta Injustificada</option>
                        <option value="Comportamento Inadequado">Comportamento Inadequado</option>
                        <option value="Descumprimento de Normas">Descumprimento de Normas</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravidade</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" required>
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="incidentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Ocorrência</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" required />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field} 
                      placeholder="Descreva a ocorrência detalhadamente..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm min-h-[100px] resize-vertical"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reporterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pelo Registro</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingEmployees ? (
                          <SelectItem value="" disabled>Carregando...</SelectItem>
                        ) : (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Registrar Ocorrência
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};