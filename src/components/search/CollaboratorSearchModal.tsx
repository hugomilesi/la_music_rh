
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail, MapPin, User, Lock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Employee } from '@/types/employee';
import { Unit } from '@/types/unit';
import { usePermissionsV2 } from '@/hooks/usePermissionsV2';

interface CollaboratorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollaboratorSearchModal: React.FC<CollaboratorSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const { employees } = useEmployees();
  const { canViewModule } = usePermissionsV2();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  // Verificar se o usuário tem permissão para visualizar colaboradores
  const canViewEmployees = useMemo(() => canViewModule('usuarios'), [canViewModule]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees([]);
      return;
    }

    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.units.some(unit => unit.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  if (!canViewEmployees) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Acesso Negado
            </DialogTitle>
            <DialogDescription>
              Você não tem permissão para visualizar informações de colaboradores.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getUnitDisplayName = (unit: Unit) => {
    const unitNames = {
      [Unit.CAMPO_GRANDE]: 'Campo Grande',
      [Unit.BARRA]: 'Barra',
      [Unit.RECREIO]: 'Recreio'
    };
    return unitNames[unit] || unit;
  };

  const handleEmployeeSelect = (employee: Employee) => {
    // Here you could implement actions like opening employee details, calling, etc.
    // Funcionário selecionado
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Colaboradores
          </DialogTitle>
          <DialogDescription>
            Encontre rapidamente colaboradores por nome, email, cargo ou unidade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Digite o nome, email, cargo ou unidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {searchTerm.trim() === '' && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Digite para buscar colaboradores</p>
              </div>
            )}

            {searchTerm.trim() !== '' && filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum colaborador encontrado</p>
                <p className="text-sm">Tente ajustar os termos de busca</p>
              </div>
            )}

            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleEmployeeSelect(employee)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{employee.position}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {employee.units.map((unit) => (
                        <Badge key={unit} variant="secondary" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {getUnitDisplayName(unit)}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
