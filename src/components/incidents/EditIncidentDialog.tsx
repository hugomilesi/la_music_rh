
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useIncidents, Incident } from '@/contexts/IncidentsContext';
import { useToast } from '@/hooks/use-toast';

interface EditIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
}

interface IncidentFormData {
  employee: string;
  type: string;
  severity: 'leve' | 'moderado' | 'grave';
  description: string;
  date: string;
  reporter: string;
  status: 'ativo' | 'resolvido' | 'arquivado';
}

export const EditIncidentDialog: React.FC<EditIncidentDialogProps> = ({
  open,
  onOpenChange,
  incident
}) => {
  const { updateIncident } = useIncidents();
  const { toast } = useToast();
  
  const form = useForm<IncidentFormData>({
    defaultValues: {
      employee: incident?.employee || '',
      type: incident?.type || '',
      severity: incident?.severity || 'leve',
      description: incident?.description || '',
      date: incident?.date || '',
      reporter: incident?.reporter || '',
      status: incident?.status || 'ativo'
    }
  });

  React.useEffect(() => {
    if (incident) {
      form.reset({
        employee: incident.employee,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        date: incident.date,
        reporter: incident.reporter,
        status: incident.status
      });
    }
  }, [incident, form]);

  const onSubmit = (data: IncidentFormData) => {
    if (!incident) return;
    
    updateIncident(incident.id, data);
    
    toast({
      title: "Ocorrência atualizada",
      description: "A ocorrência foi atualizada com sucesso.",
    });
    
    onOpenChange(false);
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Ocorrência #{incident.id}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do colaborador" required />
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gravidade</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" required>
                        <option value="leve">Leve</option>
                        <option value="moderado">Moderado</option>
                        <option value="grave">Grave</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" required>
                        <option value="ativo">Ativo</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="arquivado">Arquivado</option>
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
              name="reporter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pelo Registro</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do responsável" required />
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
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
