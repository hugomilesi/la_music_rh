
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Unit } from '@/types/unit';

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'employees' | 'turnover' | 'nps' | 'alerts' | 'admissions' | 'evaluations' | 'hours' | 'incidents' | null;
}

const getUnitName = (unit: Unit): string => {
  switch (unit) {
    case Unit.CAMPO_GRANDE:
      return 'Campo Grande';
    case Unit.RECREIO:
      return 'Recreio';
    case Unit.BARRA:
      return 'Barra';
    default:
      return 'Unidade';
  }
};

export const KPIModal: React.FC<KPIModalProps> = ({ isOpen, onClose, type }) => {
  const { employees } = useEmployees();

  if (!type) return null;

  const getModalContent = () => {
    switch (type) {
      case 'employees':
        const activeEmployees = employees.filter(emp => emp.status === 'active');
        const employeesByUnit = {
          [Unit.CAMPO_GRANDE]: activeEmployees.filter(emp => emp.units.includes(Unit.CAMPO_GRANDE)),
          [Unit.RECREIO]: activeEmployees.filter(emp => emp.units.includes(Unit.RECREIO)),
          [Unit.BARRA]: activeEmployees.filter(emp => emp.units.includes(Unit.BARRA))
        };

        return {
          title: 'Colaboradores Ativos',
          description: 'Detalhamento dos colaboradores por unidade',
          content: (
            <div className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(employeesByUnit).map(([unit, unitEmployees]) => (
                  <Card key={unit}>
                    <CardHeader>
                      <CardTitle className="text-lg">{getUnitName(unit as Unit)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold">{unitEmployees.length}</span>
                        <Badge variant="outline">colaboradores</Badge>
                      </div>
                      <div className="space-y-2">
                        {unitEmployees.slice(0, 5).map(emp => (
                          <div key={emp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-sm text-gray-600">{emp.position}</span>
                          </div>
                        ))}
                        {unitEmployees.length > 5 && (
                          <p className="text-sm text-gray-500">+{unitEmployees.length - 5} mais</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        };

      case 'turnover':
        return {
          title: 'Turnover Mensal',
          description: 'Análise detalhada do turnover por período',
          content: (
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Últimos 3 Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Dezembro 2024</span>
                        <Badge variant="outline" className="text-green-600">2.8%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Novembro 2024</span>
                        <Badge variant="outline" className="text-green-600">3.2%</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Outubro 2024</span>
                        <Badge variant="outline" className="text-orange-600">4.5%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        };

      case 'nps':
        return {
          title: 'NPS Interno',
          description: 'Detalhamento da pesquisa de clima organizacional',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Última Pesquisa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Promotores</span>
                      <span className="font-bold text-green-600">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Neutros</span>
                      <span className="font-bold text-yellow-600">20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Detratores</span>
                      <span className="font-bold text-red-600">12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        };

      default:
        return {
          title: 'Detalhes do KPI',
          description: 'Informações detalhadas sobre este indicador',
          content: <p>Dados em desenvolvimento...</p>
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {modalContent.title}
          </DialogTitle>
          <DialogDescription>
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>
        {modalContent.content}
      </DialogContent>
    </Dialog>
  );
};
