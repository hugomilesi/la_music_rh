
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DocumentFilter } from '@/types/document';
import { useDocuments } from '@/contexts/DocumentContext';
import { useEmployees } from '@/contexts/EmployeeContext';

interface AdvancedFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedFiltersDialog: React.FC<AdvancedFiltersDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { filter, setFilter } = useDocuments();
  const { employees } = useEmployees();
  const [tempFilter, setTempFilter] = useState<DocumentFilter>(filter);

  const handleApplyFilters = () => {
    setFilter(tempFilter);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilter: DocumentFilter = {
      searchTerm: '',
      type: 'all',
      status: 'all',
      employee: ''
    };
    setTempFilter(clearedFilter);
    setFilter(clearedFilter);
  };

  const documentStatuses = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'válido', label: 'Válidos' },
    { value: 'vencendo', label: 'Vencendo' },
    { value: 'vencido', label: 'Vencidos' },
    { value: 'pendente', label: 'Pendentes' }
  ];

  const documentTypes = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'obrigatorio', label: 'Obrigatórios' },
    { value: 'temporario', label: 'Temporários' },
    { value: 'complementar', label: 'Complementares' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Term */}
          <div>
            <Label htmlFor="search">Buscar por</Label>
            <Input
              id="search"
              placeholder="Nome do colaborador ou documento..."
              value={tempFilter.searchTerm}
              onChange={(e) => setTempFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            />
          </div>

          {/* Employee Filter */}
          <div>
            <Label htmlFor="employee">Colaborador</Label>
            <Select
              value={tempFilter.employee || "all"}
              onValueChange={(value) => setTempFilter(prev => ({ ...prev, employee: value === "all" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os colaboradores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os colaboradores</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type */}
          <div>
            <Label htmlFor="type">Tipo de Documento</Label>
            <Select
              value={tempFilter.type}
              onValueChange={(value) => setTempFilter(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={tempFilter.status}
              onValueChange={(value) => setTempFilter(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label>Período de Upload</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <Label htmlFor="startDate" className="text-xs text-gray-500">Data Inicial</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={tempFilter.dateRange?.start || ''}
                  onChange={(e) => setTempFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value, end: prev.dateRange?.end || '' }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs text-gray-500">Data Final</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={tempFilter.dateRange?.end || ''}
                  onChange={(e) => setTempFilter(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value, start: prev.dateRange?.start || '' }
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar Filtros
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
