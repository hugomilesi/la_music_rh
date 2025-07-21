import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, MapPin, Lock } from 'lucide-react';
import { Employee } from '@/types/employee';
import { Unit } from '@/types/unit';
import { useEmployees } from '@/contexts/EmployeeContext';
import { usePermissions } from '@/hooks/usePermissions';

interface EmployeeSelectorProps {
  value?: string;
  onChange: (employeeId: string, employeeName: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  value,
  onChange,
  placeholder = "Buscar funcionário...",
  error,
  disabled = false
}) => {
  const { employees, isLoading, error: employeesError } = useEmployees();
  const { checkPermission } = usePermissions();
  const canViewEmployees = checkPermission('canManageEmployees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || isLoading || employeesError !== null || !employees || employees.length === 0 || !canViewEmployees;

  // Set initial selected employee name based on value
  useEffect(() => {
    if (value && employees) {
      const employee = employees.find(emp => emp.id === value);
      if (employee) {
        setSelectedEmployeeName(employee.name);
        setSearchTerm(employee.name);
      }
    } else {
      setSelectedEmployeeName('');
      setSearchTerm('');
    }
  }, [value, employees]);

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
    setIsOpen(filtered.length > 0 && searchTerm !== selectedEmployeeName);
  }, [searchTerm, employees, isDisabled, selectedEmployeeName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to selected employee name if no selection was made
        if (selectedEmployeeName) {
          setSearchTerm(selectedEmployeeName);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedEmployeeName]);

  const getUnitDisplayName = (unit: Unit) => {
    const unitNames = {
      [Unit.CAMPO_GRANDE]: 'Campo Grande',
      [Unit.BARRA]: 'Barra',
      [Unit.RECREIO]: 'Recreio'
    };
    return unitNames[unit] || unit;
  };

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployeeName(employee.name);
    setSearchTerm(employee.name);
    setIsOpen(false);
    onChange(employee.id, employee.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDisabled) {
      const newValue = e.target.value;
      setSearchTerm(newValue);
      
      // If user clears the input, clear the selection
      if (newValue === '') {
        setSelectedEmployeeName('');
        onChange('', '');
      }
    }
  };

  const handleInputFocus = () => {
    if (!isDisabled) {
      setIsOpen(searchTerm.trim() !== '' && filteredEmployees.length > 0);
    }
  };

  const getPlaceholderText = () => {
    if (!canViewEmployees) return "Sem permissão para visualizar funcionários";
    if (isLoading) return "Carregando funcionários...";
    if (employeesError) return "Erro ao carregar funcionários";
    if (!employees || employees.length === 0) return "Nenhum funcionário disponível";
    return placeholder;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        {canViewEmployees ? (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        ) : (
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
        <Input
          ref={inputRef}
          placeholder={getPlaceholderText()}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={isDisabled}
          className={`pl-10 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {isOpen && !isDisabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum funcionário encontrado</p>
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
                      <p className="text-xs text-gray-500 mb-2">{employee.department}</p>
                      
                      {employee.units && employee.units.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {employee.units.map((unit) => (
                            <Badge key={unit} variant="secondary" className="text-xs px-1 py-0">
                              <MapPin className="w-2 h-2 mr-1" />
                              {getUnitDisplayName(unit)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};