
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useBenefits } from '@/contexts/BenefitsContext';
import { Benefit } from '@/types/benefits';

interface EditBenefitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: Benefit;
}

export const EditBenefitDialog: React.FC<EditBenefitDialogProps> = ({
  open,
  onOpenChange,
  benefit
}) => {
  const { updateBenefit } = useBenefits();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    provider: '',
    maxBeneficiaries: '',
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (benefit) {
      setFormData({
        name: benefit.name,
        description: benefit.description,
        value: benefit.value.toString(),
        provider: benefit.provider,
        maxBeneficiaries: benefit.maxBeneficiaries.toString(),
        isActive: benefit.isActive,
        startDate: benefit.startDate,
        endDate: benefit.endDate || ''
      });
    }
  }, [benefit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateBenefit(benefit.id, {
      name: formData.name,
      description: formData.description,
      value: parseFloat(formData.value),
      provider: formData.provider,
      maxBeneficiaries: parseInt(formData.maxBeneficiaries),
      isActive: formData.isActive,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Benefício</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Benefício</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">Fornecedor</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxBeneficiaries">Máx. Beneficiários</Label>
              <Input
                id="maxBeneficiaries"
                type="number"
                min="1"
                value={formData.maxBeneficiaries}
                onChange={(e) => setFormData({ ...formData, maxBeneficiaries: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Benefício ativo</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
