
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Lock } from 'lucide-react';
import { useIncidents } from '@/contexts/IncidentsContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

interface EditIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: {
    id: string;
    employee?: string;
    type: string;
    severity: 'baixa' | 'media' | 'alta' | 'critica';
    description: string;
    incidentDate: string;
    reporter?: string;
    status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  } | null;
}

interface IncidentFormData {
  employeeId: string;
  type: string;
  severity: 'baixa' | 'media' | 'alta' | 'critica';
  description: string;
  incidentDate: string;
  reporterId: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
}

export const EditIncidentDialog: React.FC<EditIncidentDialogProps> = ({
  open,
  onOpenChange,
  incident
}) => {
  const { updateIncident } = useIncidents();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { checkPermission } = usePermissions();
  
  // Verificar se o usuário tem permissão para gerenciar colaboradores
  const canManageEmployees = useMemo(() => checkPermission('canManageEmployees', false), [checkPermission]);
  
  if (!canManageEmployees) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para editar ocorrências de colaboradores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  const form = useForm<IncidentFormData>({
    defaultValues: {
      employeeId: incident?.employee || '',
      type: incident?.type || '',
      severity: incident?.severity || 'baixa',
      description: incident?.description || '',
      incidentDate: incident?.incidentDate || '',
      reporterId: incident?.reporter || '',
      status: incident?.status || 'aberto'
    }
  });

  React.useEffect(() => {
    if (incident) {
      form.reset({
        employeeId: incident.employee || '',
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: incident.incidentDate,
        reporterId: incident.reporter || '',
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

            <div className="grid grid-cols-3 gap-4">
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm" required>
                        <option value="aberto">Aberto</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="cancelado">Cancelado</option>
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
                    <Combobox
                      options={employees.map((employee) => ({
                        value: employee.id,
                        label: employee.name,
                      }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione o responsável"
                      searchPlaceholder="Buscar responsável..."
                      emptyText="Nenhum colaborador encontrado."
                    />
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
