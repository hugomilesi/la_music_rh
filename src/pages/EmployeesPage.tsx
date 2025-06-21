
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Download } from 'lucide-react';

const EmployeesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-gray-600 mt-1">Gestão completa da equipe LA Music</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Funcionalidade de colaboradores em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default EmployeesPage;
