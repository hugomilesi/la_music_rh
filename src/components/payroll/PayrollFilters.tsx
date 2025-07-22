import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { Unit, PayrollFilters as PayrollFiltersType } from '@/types/payroll';

interface PayrollFiltersProps {
  units: Unit[];
  onFiltersChange: (filters: PayrollFiltersType) => void;
}

export function PayrollFilters({ units, onFiltersChange }: PayrollFiltersProps) {
  const [filters, setFilters] = useState<PayrollFiltersType>({});

  const handleFilterChange = (field: keyof PayrollFiltersType, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value || undefined
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  const classifications = [
    'Mensalista',
    'PJ',
    'Estágio',
    'Freelancer'
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {/* Unit Filter */}
            <div className="space-y-2">
              <Label htmlFor="unit-filter">Unidade</Label>
              <Select
                value={filters.unit || ''}
                onValueChange={(value) => handleFilterChange('unit', value)}
              >
                <SelectTrigger id="unit-filter">
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as unidades</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Classification Filter */}
            <div className="space-y-2">
              <Label htmlFor="classification-filter">Classificação</Label>
              <Select
                value={filters.classification || ''}
                onValueChange={(value) => handleFilterChange('classification', value)}
              >
                <SelectTrigger id="classification-filter">
                  <SelectValue placeholder="Todas as classificações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as classificações</SelectItem>
                  {classifications.map(classification => (
                    <SelectItem key={classification} value={classification}>
                      {classification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <Label htmlFor="role-filter">Cargo/Função</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role-filter"
                  placeholder="Buscar por cargo..."
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="name-filter">Nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name-filter"
                  placeholder="Buscar por nome..."
                  value={filters.name || ''}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}