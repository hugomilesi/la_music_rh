
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Phone, Mail, MapPin, User, Lock } from 'lucide-react';
import { Employee } from '@/types/employee';
import { Unit } from '@/types/unit';
import { EditEmployeeDialog } from '@/components/employees/EditEmployeeDialog';
import { useEmployees } from '@/contexts/EmployeeContext';
import { usePermissions } from '@/hooks/usePermissions';

interface CollaboratorSearchDropdownProps {
  placeholder?: string;
  className?: string;
}

export const CollaboratorSearchDropdown: React.FC<CollaboratorSearchDropdownProps> = ({
  placeholder = "Buscar colaboradores...",
  className = "w-80"
}) => {
  // Use the real employee context hook
  const { employees, isLoading, error } = useEmployees();
  const { checkPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar se o usuário tem permissão para visualizar colaboradores
  const canViewEmployees = useMemo(() => checkPermission('canManageEmployees', false), [checkPermission]);

  // If loading or error, show appropriate state
  const isDisabled = isLoading || error !== null || !employees || employees.length === 0 || !canViewEmployees;

  useEffect(() => {
    if (isDisabled || searchTerm.trim() === '') {
      setFilteredEmployees([]);
      setIsOpen(false);
      return;
    }

    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.units?.some(unit => unit.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredEmployees(filtered);
    setIsOpen(filtered.length > 0);
  }, [searchTerm, employees, isDisabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUnitDisplayName = (unit: Unit) => {
    const unitNames = {
      [Unit.CAMPO_GRANDE]: 'Campo Grande',
      [Unit.BARRA]: 'Barra',
      [Unit.RECREIO]: 'Recreio'
    };
    return unitNames[unit] || unit;
  };

  const handleEmployeeSelect = (employee: Employee) => {
    console.log('Employee selected:', employee);
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDisabled) {
      setSearchTerm(e.target.value);
    }
  };

  const handleInputFocus = () => {
    if (!isDisabled && searchTerm.trim() !== '' && filteredEmployees.length > 0) {
      setIsOpen(true);
    }
  };

  const getPlaceholderText = () => {
    if (!canViewEmployees) return "Sem permissão para visualizar colaboradores";
    if (isLoading) return "Carregando colaboradores...";
    if (error) return "Erro ao carregar colaboradores";
    if (!employees || employees.length === 0) return "Nenhum colaborador disponível";
    return placeholder;
  };

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            ref={inputRef}
            placeholder={getPlaceholderText()}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={isDisabled}
            className="pl-10"
          />
        </div>

        {isOpen && !isDisabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum colaborador encontrado</p>
              </div>
            ) : (
              <div className="py-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">
                          {employee.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{employee.position}</p>
                        
                        {employee.units && employee.units.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {employee.units.map((unit) => (
                              <Badge key={unit} variant="secondary" className="text-xs px-1 py-0">
                                <MapPin className="w-2 h-2 mr-1" />
                                {getUnitDisplayName(unit)}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span className="truncate">{employee.phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Mail className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!isDisabled && (
        <EditEmployeeDialog
          employee={selectedEmployee}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
};
