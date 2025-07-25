import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, MapPin } from 'lucide-react';
import { Evaluation } from '@/types/evaluation';

interface SmartFiltersProps {
  evaluations: Evaluation[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (value: string) => void;
  selectedUnit: string;
  onUnitChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  // Coffee Connection specific filters
  selectedLocation?: string;
  onLocationChange?: (value: string) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (value: string) => void;
}

export const SmartFilters: React.FC<SmartFiltersProps> = ({
  evaluations,
  searchTerm,
  onSearchChange,
  selectedEmployee,
  onEmployeeChange,
  selectedUnit,
  onUnitChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedLocation = '',
  onLocationChange,
  selectedDateRange = '',
  onDateRangeChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters
  React.useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedEmployee) count++;
    if (selectedUnit) count++;
    if (selectedType) count++;
    if (selectedStatus) count++;
    if (selectedLocation) count++;
    if (selectedDateRange) count++;
    setActiveFiltersCount(count);
  }, [searchTerm, selectedEmployee, selectedUnit, selectedType, selectedStatus, selectedLocation, selectedDateRange]);

  const clearAllFilters = () => {
    onSearchChange('');
    onEmployeeChange('');
    onUnitChange('');
    onTypeChange('');
    onStatusChange('');
    if (onLocationChange) onLocationChange('');
    if (onDateRangeChange) onDateRangeChange('');
  };

  const isCoffeeConnectionSelected = selectedType === 'Coffee Connection';
  const coffeeConnections = evaluations.filter(e => e.type === 'Coffee Connection');
  const uniqueLocations = Array.from(new Set(coffeeConnections.map(e => e.location).filter(Boolean)));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Primary Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por colaborador..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[140px]"
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option value="">Todos os Tipos</option>
                <option value="Avaliação 360°">Avaliação 360°</option>
                <option value="Auto Avaliação">Auto Avaliação</option>
                <option value="Avaliação do Gestor">Avaliação do Gestor</option>
                <option value="Coffee Connection">Coffee Connection</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm min-w-[120px]"
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="Concluída">Concluída</option>
                <option value="Em Andamento">Em Andamento</option>
              </select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Employee Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Colaborador</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={selectedEmployee}
                    onChange={(e) => onEmployeeChange(e.target.value)}
                  >
                    <option value="">Todos os Colaboradores</option>
                    {Array.from(new Set(evaluations.map(e => e.employee))).map((employee) => (
                      <option key={employee} value={employee}>
                        {employee}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Unidade</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={selectedUnit}
                    onChange={(e) => onUnitChange(e.target.value)}
                  >
                    <option value="">Todas as Unidades</option>
                    <option value="Campo Grande">Campo Grande</option>
                    <option value="Recreio">Recreio</option>
                    <option value="Barra">Barra</option>
                  </select>
                </div>

                {/* Coffee Connection Specific Filters */}
                {isCoffeeConnectionSelected && (
                  <>
                    {/* Location Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Local
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={selectedLocation}
                        onChange={(e) => onLocationChange?.(e.target.value)}
                      >
                        <option value="">Todos os Locais</option>
                        {uniqueLocations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Período
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        value={selectedDateRange}
                        onChange={(e) => onDateRangeChange?.(e.target.value)}
                      >
                        <option value="">Todos os Períodos</option>
                        <option value="today">Hoje</option>
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mês</option>
                        <option value="quarter">Este Trimestre</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Busca: "{searchTerm}"
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onSearchChange('')} />
                      </Badge>
                    )}
                    {selectedEmployee && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedEmployee}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onEmployeeChange('')} />
                      </Badge>
                    )}
                    {selectedUnit && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedUnit}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onUnitChange('')} />
                      </Badge>
                    )}
                    {selectedType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedType}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onTypeChange('')} />
                      </Badge>
                    )}
                    {selectedStatus && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {selectedStatus}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onStatusChange('')} />
                      </Badge>
                    )}
                    {selectedLocation && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedLocation}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onLocationChange?.('')} />
                      </Badge>
                    )}
                    {selectedDateRange && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedDateRange === 'today' ? 'Hoje' : 
                         selectedDateRange === 'week' ? 'Esta Semana' :
                         selectedDateRange === 'month' ? 'Este Mês' : 'Este Trimestre'}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => onDateRangeChange?.('')} />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartFilters;