
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar, Eye } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { VacationAlert } from '@/types/vacation';

interface VacationAlertsProps {
  onViewAlertDetails?: (alertId: string) => void;
}

export const VacationAlerts: React.FC<VacationAlertsProps> = ({ onViewAlertDetails }) => {
  const { vacationAlerts } = useVacation();

  const getAlertIcon = (type: VacationAlert['type']) => {
    switch (type) {
      case 'expiring_vacation':
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'pending_approval':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'balance_low':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: VacationAlert['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600">Média</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return null;
    }
  };

  const getAlertTitle = (type: VacationAlert['type']) => {
    switch (type) {
      case 'expiring_vacation':
        return 'Férias expirando';
      case 'pending_approval':
        return 'Aprovação pendente';
      case 'balance_low':
        return 'Saldo baixo';
      default:
        return 'Alerta';
    }
  };

  if (vacationAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta</h3>
          <p className="text-gray-500">Não há alertas de férias no momento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Alertas de Férias</h2>
        <Badge variant="outline">
          {vacationAlerts.length} {vacationAlerts.length === 1 ? 'alerta' : 'alertas'}
        </Badge>
      </div>

      <div className="space-y-3">
        {vacationAlerts.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-orange-400">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{getAlertTitle(alert.type)}</h3>
                      {getPriorityBadge(alert.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{alert.employeeName}:</span> {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewAlertDetails && onViewAlertDetails(alert.id)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
