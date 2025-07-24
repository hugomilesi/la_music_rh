
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter } from 'lucide-react';

interface PeriodFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilter: (filter: { startDate: string; endDate: string; period: string }) => void;
}

export const PeriodFilterModal: React.FC<PeriodFilterModalProps> = ({
  open,
  onOpenChange,
  onApplyFilter
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const predefinedPeriods = [
    { id: 'current', label: 'Mês Atual', description: 'Março 2024' },
    { id: 'last30', label: 'Últimos 30 dias', description: 'Período móvel' },
    { id: 'quarter', label: 'Trimestre Atual', description: 'Jan - Mar 2024' },
    { id: 'last90', label: 'Últimos 90 dias', description: 'Período móvel' },
    { id: 'year', label: 'Ano Atual', description: '2024' },
    { id: 'custom', label: 'Período Personalizado', description: 'Escolha as datas' }
  ];

  const handleApply = () => {
    let startDate = '';
    let endDate = '';
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (selectedPeriod) {
      case 'current':
        startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
        break;
      case 'last30':
        endDate = now.toISOString().split('T')[0];
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'quarter': {
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        startDate = new Date(currentYear, quarterStart, 1).toISOString().split('T')[0];
        endDate = new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0];
        break;
      }
      case 'last90':
        endDate = now.toISOString().split('T')[0];
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`;
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
    }

    if (!startDate || !endDate) {
      alert('Por favor, selecione um período válido');
      return;
    }

    if (selectedPeriod === 'custom' && new Date(startDate) > new Date(endDate)) {
      alert('A data de início deve ser anterior à data de término');
      return;
    }

    onApplyFilter({
      startDate,
      endDate,
      period: selectedPeriod
    });

    onOpenChange(false);
    console.log('Filtro aplicado:', { startDate, endDate, period: selectedPeriod });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtrar por Período
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedPeriods.map((period) => (
              <Card 
                key={period.id}
                className={`cursor-pointer transition-all ${
                  selectedPeriod === period.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedPeriod(period.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{period.label}</h4>
                      <p className="text-sm text-gray-600">{period.description}</p>
                    </div>
                    {selectedPeriod === period.id && (
                      <Badge>Selecionado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPeriod === 'custom' && (
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Período Personalizado</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customStartDate">Data de Início</Label>
                    <Input
                      id="customStartDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customEndDate">Data de Término</Label>
                    <Input
                      id="customEndDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply}>
              <Calendar className="w-4 h-4 mr-2" />
              Aplicar Filtro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
