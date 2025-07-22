
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Payroll } from '@/types/payroll';

interface EditPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: Payroll | null;
  onUpdatePayroll: (updates: Partial<Payroll>) => void;
}

export function EditPayrollDialog({
  open,
  onOpenChange,
  payroll,
  onUpdatePayroll
}: EditPayrollDialogProps) {
  const [status, setStatus] = useState<'draft' | 'approved' | 'paid'>('draft');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (payroll) {
      setStatus(payroll.status);
      setNotes(''); // Notes would come from a separate field if implemented
    }
  }, [payroll]);

  const handleSubmit = () => {
    if (!payroll) return;

    onUpdatePayroll({
      id: payroll.id,
      status,
    });
    onOpenChange(false);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (!payroll) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Editar Folha - {getMonthName(payroll.month)}/{payroll.year}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'draft' | 'approved' | 'paid') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre esta folha..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Criada em: {new Date(payroll.created_at).toLocaleDateString('pt-BR')}</p>
            <p>Última atualização: {new Date(payroll.updated_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
