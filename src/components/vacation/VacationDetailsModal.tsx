
import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Edit,
  Save
} from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { VacationRequest } from '@/types/vacation';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface VacationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export const VacationDetailsModal: React.FC<VacationDetailsModalProps> = ({
  isOpen,
  onClose,
  requestId
}) => {
  const { 
    vacationRequests, 
    approveVacationRequest, 
    rejectVacationRequest,
    getEmployeeBalance
  } = useVacation();
  const { employees } = useEmployees();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Helper function to safely format dates
  const formatSafeDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'Data inválida';
    
    const date = new Date(dateValue);
    if (!isValid(date)) return 'Data inválida';
    
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const request = vacationRequests.find(req => req.id === requestId);
  const employee = employees.find(emp => emp.id === request?.employeeId);
  const balance = request ? getEmployeeBalance(request.employeeId) : null;

  if (!request) return null;

  const getStatusBadge = (status: VacationRequest['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-orange-600">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-600">Aprovada</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="text-red-600">Rejeitada</Badge>;
    }
  };

  const getTypeBadge = (type: VacationRequest['type']) => {
    const typeLabels = {
      vacation: 'Férias',
      medical: 'Licença Médica',
      personal: 'Licença Pessoal',
      maternity: 'Licença Maternidade',
      paternity: 'Licença Paternidade',
    };
    return <Badge variant="secondary">{typeLabels[type]}</Badge>;
  };

  const handleApprove = () => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }
    
    approveVacationRequest(request.id, user.id);
    toast({
      title: 'Solicitação aprovada',
      description: 'A solicitação de férias foi aprovada com sucesso.',
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o motivo da rejeição.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado.',
        variant: 'destructive',
      });
      return;
    }
    
    rejectVacationRequest(request.id, rejectionReason, user.id);
    toast({
      title: 'Solicitação rejeitada',
      description: 'A solicitação de férias foi rejeitada.',
    });
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalhes da Solicitação de Férias
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre a solicitação de {request.employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            {getStatusBadge(request.status)}
            {getTypeBadge(request.type)}
          </div>

          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Nome:</span>
                  <p>{request.employeeName}</p>
                </div>
                {employee && (
                  <>
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
                      <p>{formatSafeDate(employee.start_date)}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vacation Balance */}
          {balance && (
            <Card>
              <CardHeader>
                <CardTitle>Saldo de Férias</CardTitle>
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
                      {formatSafeDate(balance.expirationDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Detalhes da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Data de Início:</span>
                  <p>{formatSafeDate(request.startDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data de Fim:</span>
                  <p>{formatSafeDate(request.endDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total de Dias:</span>
                  <p className="font-bold text-blue-600">{request.days} dias</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <span className="font-medium text-gray-700">Motivo:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{request.reason}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Data da Solicitação:</span>
                <p>{formatSafeDate(request.requestDate)}</p>
              </div>

              {request.status === 'aprovado' && request.approvedBy && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Aprovada por:</span>
                  <p className="text-green-700">{request.approvedBy}</p>
                  {request.approvedDate && (
                    <p className="text-sm text-green-600">
                      em {formatSafeDate(request.approvedDate)}
                    </p>
                  )}
                </div>
              )}

              {request.status === 'rejeitado' && request.rejectionReason && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">Rejeitada por:</span>
                  <p className="text-red-700">{request.approvedBy}</p>
                  <span className="font-medium text-red-800">Motivo:</span>
                  <p className="text-red-700">{request.rejectionReason}</p>
                  {request.approvedDate && (
                    <p className="text-sm text-red-600">
                      em {formatSafeDate(request.approvedDate)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {request.status === 'pendente' && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent>
                {!showRejectForm ? (
                  <div className="flex gap-3">
                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-2" />
                      Aprovar Solicitação
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRejectForm(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeitar Solicitação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo da Rejeição
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Informe o motivo da rejeição..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleReject} variant="destructive">
                        <X className="w-4 h-4 mr-2" />
                        Confirmar Rejeição
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectionReason('');
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
