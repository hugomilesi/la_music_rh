
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { EmployeeProvider, useEmployees } from '@/contexts/EmployeeContext';
import { NewEmployeeDialog } from '@/components/employees/NewEmployeeDialog';
import { EmployeeFilters } from '@/components/employees/EmployeeFilters';
import { EmployeeCard } from '@/components/employees/EmployeeCard';

const EmployeesContent: React.FC = () => {
  const [isNewEmployeeDialogOpen, setIsNewEmployeeDialogOpen] = useState(false);
  const { filteredEmployees, employees } = useEmployees();

  const handleExport = () => {
    // Simple CSV export for demonstration
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Cargo', 'Departamento', 'Status', 'Data de Início'],
      ...employees.map(emp => [
        emp.name,
        emp.email,
        emp.phone,
        emp.position,
        emp.department,
        emp.status === 'active' ? 'Ativo' : 'Inativo',
        new Date(emp.startDate).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colaboradores.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600 mt-1">
            Gestão completa da equipe LA Music ({employees.length} colaboradores)
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setIsNewEmployeeDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <EmployeeFilters />
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum colaborador encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {employees.length === 0 
                ? 'Comece adicionando o primeiro colaborador à equipe.'
                : 'Tente ajustar os filtros ou termos de busca.'
              }
            </p>
            {employees.length === 0 && (
              <Button onClick={() => setIsNewEmployeeDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Colaborador
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>

      <NewEmployeeDialog
        open={isNewEmployeeDialogOpen}
        onOpenChange={setIsNewEmployeeDialogOpen}
      />
    </div>
  );
};

const EmployeesPage: React.FC = () => {
  return (
    <EmployeeProvider>
      <EmployeesContent />
    </EmployeeProvider>
  );
};

export default EmployeesPage;
