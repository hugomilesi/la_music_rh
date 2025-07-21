
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
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  FileText,
  Eye
} from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { VacationAlert } from '@/types/vacation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string | null;
  onViewVacationDetails?: (requestId: string) => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({
  isOpen,
  onClose,
  alertId,
  onViewVacationDetails
}) => {
  const { vacationAlerts, getEmployeeBalance, getEmployeeVacations } = useVacation();
  const { employees } = useEmployees();

  const alert = vacationAlerts.find(a => a.id === alertId);
  const employee = alert ? employees.find(emp => emp.id === alert.employeeId) : null;
  const balance = alert ? getEmployeeBalance(alert.employeeId) : null;
  const employeeVacations = alert ? getEmployeeVacations(alert.employeeId) : [];

  if (!alert) return null;

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
        return <Badge variant="destructive">Alta Prioridade</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600">Média Prioridade</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixa Prioridade</Badge>;
    }
  };

  const getAlertTitle = (type: VacationAlert['type']) => {
    switch (type) {
      case 'expiring_vacation':
        return 'Férias Expirando';
      case 'pending_approval':
        return 'Aprovação Pendente';
      case 'balance_low':
        return 'Saldo Baixo';
      default:
        return 'Alerta';
    }
  };

  const getRecommendedActions = (type: VacationAlert['type']) => {
    switch (type) {
      case 'expiring_vacation':
        return [
          'Entrar em contato com o colaborador para agendar as férias',
          'Verificar a disponibilidade da equipe para cobertura',
          'Considerar a divisão das férias em períodos menores'
        ];
      case 'pending_approval':
        return [
          'Revisar a solicitação de férias pendente',
          'Verificar o saldo disponível do colaborador',
          'Aprovar ou rejeitar a solicitação com justificativa'
        ];
      case 'balance_low':
        return [
          'Planejar períodos de férias para o colaborador',
          'Verificar histórico de férias recentes',
          'Considerar licenças remuneradas se necessário'
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAlertIcon(alert.type)}
            {getAlertTitle(alert.type)}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do alerta para {alert.employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Resumo do Alerta
                </span>
                {getPriorityBadge(alert.priority)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Mensagem:</span>
                <p className="mt-1 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">{alert.message}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data do Alerta:</span>
                <p>{format(new Date(alert.date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Employee Information */}
          {employee && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Colaborador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Nome:</span>
                    <p>{employee.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cargo:</span>
                    <p>{employee.position}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Departamento:</span>
                    <p>{employee.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Data de Admissão:</span>
                    <p>{format(new Date(employee.start_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vacation Balance */}
          {balance && (
            <Card>
              <CardHeader>
                <CardTitle>Saldo de Férias Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{balance.totalDays}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{balance.usedDays}</p>
                    <p className="text-sm text-gray-600">Utilizados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{balance.remainingDays}</p>
                    <p className="text-sm text-gray-600">Restantes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Expira em:</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(balance.expirationDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Vacation History */}
          {employeeVacations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Férias Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {employeeVacations.slice(0, 5).map((vacation) => (
                    <div key={vacation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {format(new Date(vacation.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                          {format(new Date(vacation.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                        <p className="text-sm text-gray-600">{vacation.days} dias - {vacation.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          vacation.status === 'aprovado' ? 'outline' :
vacation.status === 'pendente' ? 'secondary' : 'destructive'
                        }>
                          {vacation.status === 'aprovado' ? 'Aprovada' :
vacation.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                        </Badge>
                        {onViewVacationDetails && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewVacationDetails(vacation.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Ações Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getRecommendedActions(alert.type).map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
