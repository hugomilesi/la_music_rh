
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { useAuth } from '@/contexts/AuthContext';
import { VacationRequest } from '@/types/vacation';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationRequestsListProps {
  onViewDetails?: (requestId: string) => void;
  onEditRequest?: (request: VacationRequest) => void;
}

export const VacationRequestsList: React.FC<VacationRequestsListProps> = ({ onViewDetails, onEditRequest }) => {
  const { vacationRequests, deleteVacationRequest, updateVacationRequest } = useVacation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; employeeName: string; type: 'delete' | 'cancel' }>({ open: false, id: '', employeeName: '', type: 'delete' });

  const formatSafeDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Data inválida';
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Data inválida';
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const filteredRequests = vacationRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VacationRequest['status']) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline" className="text-orange-600">Pendente</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-600">Aprovada</Badge>;
      case 'rejeitado':
        return <Badge variant="outline" className="text-red-600">Rejeitada</Badge>;
      case 'cancelado':
        return <Badge variant="outline" className="text-gray-600">Cancelada</Badge>;
      default:
        return null;
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



  const handleDelete = (id: string, employeeName: string) => {
    setDeleteDialog({ open: true, id, employeeName, type: 'delete' });
  };

  const handleCancelApproved = (id: string, employeeName: string) => {
    setDeleteDialog({ open: true, id, employeeName, type: 'cancel' });
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'delete') {
      deleteVacationRequest(deleteDialog.id);
    } else {
      updateVacationRequest(deleteDialog.id, { status: 'cancelado' });
    }
    setDeleteDialog({ open: false, id: '', employeeName: '', type: 'delete' });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por colaborador ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovada</SelectItem>
                <SelectItem value="rejeitado">Rejeitada</SelectItem>
                <SelectItem value="cancelado">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                      {getStatusBadge(request.status)}
                      {getTypeBadge(request.type)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Período:</span>
                        <p>
                          {formatSafeDate(request.startDate)} - {formatSafeDate(request.endDate)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Dias:</span>
                        <p>{request.days} dias</p>
                      </div>
                      <div>
                        <span className="font-medium">Solicitado em:</span>
                        <p>{formatSafeDate(request.requestDate)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-sm text-gray-600">Motivo:</span>
                      <p className="text-sm">{request.reason}</p>
                    </div>

                    {request.status === 'rejeitado' && request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-sm text-red-800">Motivo da rejeição:</span>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:justify-end lg:max-w-xs">
                    <div className="flex gap-2">
                      {onEditRequest && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditRequest(request)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 lg:flex-none lg:min-w-[40px]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(request.id, request.employeeName)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 lg:flex-none lg:min-w-[40px]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails && onViewDetails(request.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1 lg:flex-none lg:min-w-[40px]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialog.type === 'delete' ? 'Excluir Solicitação' : 'Cancelar Solicitação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'delete' 
                ? `Tem certeza que deseja excluir a solicitação de férias de ${deleteDialog.employeeName}?`
                : `Tem certeza que deseja cancelar a solicitação de férias aprovada de ${deleteDialog.employeeName}? Esta ação não pode ser desfeita.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, id: '', employeeName: '', type: 'delete' })}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              {deleteDialog.type === 'delete' ? 'Excluir' : 'Cancelar Solicitação'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
