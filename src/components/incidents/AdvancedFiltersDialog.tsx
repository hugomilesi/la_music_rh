
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter } from 'lucide-react';

interface AdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: any) => void;
}

export const AdvancedFiltersDialog: React.FC<AdvancedFiltersDialogProps> = ({
  open,
  onOpenChange,
  onApplyFilters
}) => {
  const [filters, setFilters] = React.useState({
    dateFrom: '',
    dateTo: '',
    employee: '',
    reporter: '',
    severity: 'all',
    status: 'all',
    type: 'all'
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      employee: '',
      reporter: '',
      severity: 'all',
      status: 'all',
      type: 'all'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <DialogTitle>Filtros Avançados</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-gray-600">De</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-gray-600">Até</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Employee and Reporter */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Colaborador</Label>
              <Input
                id="employee"
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                placeholder="Nome do colaborador"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporter">Responsável</Label>
              <Input
                id="reporter"
                value={filters.reporter}
                onChange={(e) => setFilters(prev => ({ ...prev, reporter: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select 
                id="type"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="all">Todos os Tipos</option>
                <option value="Atraso">Atraso</option>
                <option value="Falta Injustificada">Falta Injustificada</option>
                <option value="Comportamento Inadequado">Comportamento Inadequado</option>
                <option value="Descumprimento de Normas">Descumprimento de Normas</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Gravidade</Label>
              <select 
                id="severity"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="all">Todas as Gravidades</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="grave">Grave</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativas</option>
                <option value="resolvido">Resolvidas</option>
                <option value="arquivado">Arquivadas</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleReset}>
            Limpar
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
