import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, MapPin, Lock } from 'lucide-react';
import { Colaborador } from '@/types/colaborador';
import { useColaboradores } from '@/contexts/ColaboradorContext';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';

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
  placeholder = "Buscar colaborador...",
  error,
  disabled = false
}) => {
  const { colaboradoresAtivos, loadingColaboradores } = useColaboradores();
  const { canViewModule } = usePermissionsV2();
  const canViewEmployees = useMemo(() => canViewModule('usuarios'), [canViewModule]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Colaborador[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || loadingColaboradores || !colaboradoresAtivos || colaboradoresAtivos.length === 0 || !canViewEmployees;

  // Set initial selected employee name based on value
  useEffect(() => {
    if (value && colaboradoresAtivos) {
      const colaborador = colaboradoresAtivos.find(col => col.id === value);
      if (colaborador) {
        setSelectedEmployeeName(colaborador.nome);
        setSearchTerm(colaborador.nome);
      }
    } else {
      setSelectedEmployeeName('');
      setSearchTerm('');
    }
  }, [value, colaboradoresAtivos]);

  useEffect(() => {
    if (isDisabled || searchTerm.trim() === '') {
      setFilteredEmployees([]);
      setIsOpen(false);
      return;
    }

    const filtered = colaboradoresAtivos.filter(colaborador =>
      colaborador.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      colaborador.unidade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredEmployees(filtered);
    setIsOpen(filtered.length > 0 && searchTerm !== selectedEmployeeName);
  }, [searchTerm, colaboradoresAtivos, isDisabled, selectedEmployeeName]);

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

  // Removendo função não utilizada
  
  const handleEmployeeSelect = (colaborador: Colaborador) => {
    setSelectedEmployeeName(colaborador.nome);
    setSearchTerm(colaborador.nome);
    setIsOpen(false);
    onChange(colaborador.id, colaborador.nome);
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
    if (!canViewEmployees) return "Sem permissão para visualizar colaboradores";
    if (loadingColaboradores) return "Carregando colaboradores...";
    if (!colaboradoresAtivos || colaboradoresAtivos.length === 0) return "Nenhum colaborador disponível";
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
              <p className="text-sm">Nenhum colaborador encontrado</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredEmployees.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => handleEmployeeSelect(colaborador)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {colaborador.nome}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">{colaborador.cargo}</p>
                      <p className="text-xs text-gray-500 mb-2">{colaborador.departamento}</p>
                      
                      {colaborador.unidade && (
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            <MapPin className="w-2 h-2 mr-1" />
                            {colaborador.unidade}
                          </Badge>
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