
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
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';
import { formatDateToLocal } from '@/utils/dateUtils';

interface EditIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: {
    id: string;
    employeeId?: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    incidentDate: string;
    reporterId?: string;
    status: 'ativo' | 'resolvido' | 'arquivado';
  } | null;
}

interface IncidentFormData {
  employeeId: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  incidentDate: string;
  reporterId: string;
  status: 'ativo' | 'resolvido' | 'arquivado';
}

export const EditIncidentDialog: React.FC<EditIncidentDialogProps> = ({
  open,
  onOpenChange,
  incident
}) => {
  const { updateIncident } = useIncidents();
  const { employees } = useEmployees();
  const { toast } = useToast();
  const { canEditInModule } = usePermissionsV2();
  
  // Verificar se o usuário tem permissão para gerenciar colaboradores
  const canManageEmployees = useMemo(() => canEditInModule('usuarios'), [canEditInModule]);
  
  const form = useForm<IncidentFormData>({
    defaultValues: {
      employeeId: incident?.employeeId || '',
      type: incident?.type || '',
      severity: incident?.severity || 'low',
      description: incident?.description || '',
      incidentDate: incident?.incidentDate || '',
      reporterId: incident?.reporterId || '',
      status: incident?.status || 'ativo'
    }
  });

  React.useEffect(() => {
    if (incident) {
      // Format date to YYYY-MM-DD for date input
      let formattedDate = incident.incidentDate;
      if (incident.incidentDate) {
        const date = new Date(incident.incidentDate);
        if (!isNaN(date.getTime())) {
          formattedDate = formatDateToLocal(date);
        }
      }
      
      form.reset({
        employeeId: incident.employeeId || '',
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        incidentDate: formattedDate,
        reporterId: incident.reporterId || '',
        status: incident.status
      });
    }
  }, [incident, form]);
  
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

  const onSubmit = (data: IncidentFormData) => {
    if (!incident) return;
    
    // Validate that required UUIDs are not empty
    if (!data.employeeId || data.employeeId.trim() === '') {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione um colaborador.",
        variant: "destructive"
      });
      return;
    }
    
    if (!data.reporterId || data.reporterId.trim() === '') {
      toast({
        title: "Erro de validação",
        description: "Por favor, selecione o responsável pelo registro.",
        variant: "destructive"
      });
      return;
    }
    
    // Map form data to incident format
    const updateData = {
      employeeId: data.employeeId,
      type: data.type,
      severity: data.severity,
      description: data.description,
      incidentDate: data.incidentDate,
      reporterId: data.reporterId,
      status: data.status
    };
    
    updateIncident(incident.id, updateData);
    
    toast({
      title: "Ocorrência atualizada",
      description: "A ocorrência foi atualizada com sucesso.",
    });
    
    onOpenChange(false);
  };

  if (!incident) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ocorrência</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Nenhuma ocorrência selecionada.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
