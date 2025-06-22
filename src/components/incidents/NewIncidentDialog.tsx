
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIncident } from '@/contexts/IncidentContext';
import { useToast } from '@/hooks/use-toast';

interface NewIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewIncidentDialog: React.FC<NewIncidentDialogProps> = ({ open, onOpenChange }) => {
  const { addIncident } = useIncident();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    employee: '',
    employeeId: '',
    type: '',
    severity: '',
    description: '',
    date: '',
    reporter: 'Aline Cristina Pessanha Faria'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee || !formData.type || !formData.severity || !formData.description || !formData.date) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    addIncident({
      ...formData,
      status: 'ativo'
    });

    toast({
      title: "Sucesso",
      description: "Nova ocorrência registrada com sucesso.",
    });

    // Reset form
    setFormData({
      employee: '',
      employeeId: '',
      type: '',
      severity: '',
      description: '',
      date: '',
      reporter: 'Aline Cristina Pessanha Faria'
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Ocorrência</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Colaborador *</Label>
              <Input
                id="employee"
                value={formData.employee}
                onChange={(e) => setFormData(prev => ({ ...prev, employee: e.target.value }))}
                placeholder="Nome do colaborador"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Ocorrência *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Atraso">Atraso</SelectItem>
                  <SelectItem value="Falta Injustificada">Falta Injustificada</SelectItem>
                  <SelectItem value="Comportamento Inadequado">Comportamento Inadequado</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="severity">Gravidade *</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a gravidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a ocorrência detalhadamente..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="reporter">Responsável pelo Registro</Label>
            <Input
              id="reporter"
              value={formData.reporter}
              onChange={(e) => setFormData(prev => ({ ...prev, reporter: e.target.value }))}
              readOnly
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Ocorrência
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
