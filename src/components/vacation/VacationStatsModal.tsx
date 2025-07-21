
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
import { Users, Calendar, Clock, AlertTriangle, Eye } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'total' | 'active' | 'pending' | 'alerts' | null;
  onViewDetails?: (requestId: string) => void;
}

export const VacationStatsModal: React.FC<VacationStatsModalProps> = ({
  isOpen,
  onClose,
  type,
  onViewDetails
}) => {
  const { 
    vacationRequests, 
    getActiveVacations, 
    getPendingRequests, 
    vacationAlerts 
  } = useVacation();
  const { employees } = useEmployees();

  if (!type) return null;

  const getModalContent = () => {
    switch (type) {
      case 'total':
        return {
          title: 'Total de Solicitações',
          description: 'Todas as solicitações de férias registradas',
          icon: Calendar,
          data: vacationRequests
        };
      case 'active':
        return {
          title: 'Colaboradores em Férias',
          description: 'Colaboradores que estão atualmente em férias',
          icon: Users,
          data: getActiveVacations()
        };
      case 'pending':
        return {
          title: 'Solicitações Pendentes',
          description: 'Solicitações aguardando aprovação',
          icon: Clock,
          data: getPendingRequests()
        };
      case 'alerts':
        return {
          title: 'Alertas de Férias',
          description: 'Alertas que requerem atenção',
          icon: AlertTriangle,
          data: vacationAlerts
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();
  if (!modalContent) return null;

  const Icon = modalContent.icon;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-orange-600">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-600">Aprovada</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="text-red-600">Rejeitada</Badge>;
      default:
        return null;
    }
  };

  const renderVacationRequest = (request: any) => (
    <Card key={request.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{request.employeeName}</h4>
              {getStatusBadge(request.status)}
            </div>
            <div className="text-sm text-gray-600">
              <p>Período: {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
              <p>Dias: {request.days}</p>
              <p>Motivo: {request.reason}</p>
            </div>
          </div>
          {onViewDetails && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(request.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderAlert = (alert: any) => (
    <Card key={alert.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{alert.employeeName}</h4>
              <Badge variant={alert.priority === 'high' ? 'destructive' : 'outline'}>
                {alert.priority === 'high' ? 'Alta' : alert.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{alert.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(alert.date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {modalContent.title}
          </DialogTitle>
          <DialogDescription>
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              Total: {modalContent.data.length} {modalContent.data.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {modalContent.data.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum item encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {type === 'alerts' 
                ? modalContent.data.map(renderAlert)
                : modalContent.data.map(renderVacationRequest)
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
