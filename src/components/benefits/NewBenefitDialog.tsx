
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';
import { BenefitType, EligibilityRule } from '@/types/benefits';

interface NewBenefitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewBenefitDialog: React.FC<NewBenefitDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { benefitTypes, addBenefit } = useBenefits();
  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    description: '',
    value: '',
    provider: '',
    maxBeneficiaries: '1',
    isActive: true,
    startDate: '',
    endDate: ''
  });
  const [coverage, setCoverage] = useState<string[]>([]);
  const [newCoverage, setNewCoverage] = useState('');
  const [eligibilityRules, setEligibilityRules] = useState<EligibilityRule[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.typeId || !formData.description || !formData.value || !formData.provider) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const selectedType = benefitTypes.find(type => type.id === formData.typeId);
    if (!selectedType) return;

    addBenefit({
      name: formData.name,
      type: selectedType,
      description: formData.description,
      value: parseFloat(formData.value),
      coverage,
      eligibilityRules,
      provider: formData.provider,
      isActive: formData.isActive,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      documents: [],
      maxBeneficiaries: parseInt(formData.maxBeneficiaries)
    });

    // Reset form
    setFormData({
      name: '',
      typeId: '',
      description: '',
      value: '',
      provider: '',
      maxBeneficiaries: '1',
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setCoverage([]);
    setEligibilityRules([]);
    onOpenChange(false);
  };

  const addCoverage = () => {
    if (newCoverage.trim() && !coverage.includes(newCoverage.trim())) {
      setCoverage([...coverage, newCoverage.trim()]);
      setNewCoverage('');
    }
  };

  const removeCoverage = (item: string) => {
    setCoverage(coverage.filter(c => c !== item));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Benefício</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Benefício *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Plano de Saúde Premium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Benefício *</Label>
              <Select
                value={formData.typeId}
                onValueChange={(value) => setFormData({ ...formData, typeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o benefício e suas características"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provider">Fornecedor *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Ex: Unimed, Alelo"
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

          <div className="space-y-2">
            <Label>Cobertura</Label>
            <div className="flex gap-2">
              <Input
                value={newCoverage}
                onChange={(e) => setNewCoverage(e.target.value)}
                placeholder="Adicionar item de cobertura"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoverage())}
              />
              <Button type="button" onClick={addCoverage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {coverage.map((item) => (
                <Badge key={item} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeCoverage(item)}
                  />
                </Badge>
              ))}
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
              <Label htmlFor="endDate">Data de Fim (opcional)</Label>
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
              Criar Benefício
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
