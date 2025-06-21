
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'employees' | 'turnover' | 'nps' | 'alerts' | 'admissions' | 'evaluations' | 'hours' | 'incidents';
}

export const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, type }) => {
  const { employees } = useEmployees();

  const getModalContent = () => {
    switch (type) {
      case 'employees':
        const unitStats = {
          'Campo Grande': employees.filter(emp => emp.units.some(unit => unit.name === 'Campo Grande')).length,
          'Recreio': employees.filter(emp => emp.units.some(unit => unit.name === 'Recreio')).length,
          'Barra': employees.filter(emp => emp.units.some(unit => unit.name === 'Barra')).length,
        };

        return {
          title: 'Colaboradores Ativos',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(unitStats).map(([unit, count]) => (
                  <Card key={unit}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900">{unit}</h4>
                        <p className="text-2xl font-bold text-blue-600">{count}</p>
                        <p className="text-sm text-gray-600">colaboradores</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Distribuição por Departamento</h4>
                <div className="space-y-2">
                  {['Operações', 'Bar', 'Entretenimento', 'Coordenação'].map(dept => {
                    const count = employees.filter(emp => emp.department === dept).length;
                    return (
                      <div key={dept} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{dept}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        };

      case 'turnover':
        return {
          title: 'Análise de Turnover',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Turnover por Unidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Campo Grande</span>
                        <span className="text-green-600">2.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recreio</span>
                        <span className="text-yellow-600">4.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Barra</span>
                        <span className="text-green-600">2.9%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Histórico (6 meses)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((month, index) => (
                        <div key={month} className="flex justify-between">
                          <span>{month}</span>
                          <span>{(2.5 + Math.random() * 2).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        };

      case 'nps':
        return {
          title: 'NPS Interno - Detalhamento',
          content: (
            <div className="space-y-4">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl font-bold text-purple-600">8.4</div>
                <div className="text-gray-600">Score atual</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">65%</div>
                  <div className="text-sm text-gray-600">Promotores</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">28%</div>
                  <div className="text-sm text-gray-600">Neutros</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">7%</div>
                  <div className="text-sm text-gray-600">Detratores</div>
                </div>
              </div>
            </div>
          )
        };

      case 'alerts':
        return {
          title: 'Alertas Pendentes',
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-900">Documentos Vencidos (7)</span>
                  </div>
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    <li>• João Silva - ASO vencido há 5 dias</li>
                    <li>• Maria Santos - Curso de segurança expirado</li>
                    <li>• Pedro Costa - Exame médico pendente</li>
                    <li>• +4 outros colaboradores</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-orange-900">Avaliações Próximas (5)</span>
                  </div>
                  <ul className="mt-2 text-sm text-orange-700 space-y-1">
                    <li>• Ana Silva - Avaliação em 3 dias</li>
                    <li>• Carlos Oliveira - Avaliação em 5 dias</li>
                    <li>• +3 outras avaliações</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Detalhes',
          content: <div>Detalhes não disponíveis para este item.</div>
        };
    }
  };

  const { title, content } = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
