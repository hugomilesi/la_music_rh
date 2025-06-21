
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useEmployees } from '@/contexts/EmployeeContext';

export const EmployeeFilters: React.FC = () => {
  const {
    searchTerm,
    departmentFilter,
    statusFilter,
    setSearchTerm,
    setDepartmentFilter,
    setStatusFilter,
  } = useEmployees();

  const departments = ['Operações', 'Bar', 'Entretenimento', 'Administração', 'Limpeza'];
  const statuses = [
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' },
  ];

  const clearFilters = () => {
    setDepartmentFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = departmentFilter || statusFilter;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar colaboradores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
            <SheetDescription>
              Filtre os colaboradores por departamento e status.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            <div>
              <Label className="text-sm font-medium">Departamento</Label>
              <div className="mt-2 space-y-2">
                <Button
                  variant={departmentFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDepartmentFilter('')}
                  className="w-full justify-start"
                >
                  Todos
                </Button>
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={departmentFilter === dept ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDepartmentFilter(dept)}
                    className="w-full justify-start"
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-2 space-y-2">
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('')}
                  className="w-full justify-start"
                >
                  Todos
                </Button>
                {statuses.map((status) => (
                  <Button
                    key={status.value}
                    variant={statusFilter === status.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status.value)}
                    className="w-full justify-start"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
