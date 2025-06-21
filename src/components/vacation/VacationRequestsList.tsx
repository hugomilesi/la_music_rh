
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
import { Search, MoreHorizontal, Check, X, Eye } from 'lucide-react';
import { useVacation } from '@/contexts/VacationContext';
import { VacationRequest } from '@/types/vacation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VacationRequestsListProps {
  onViewDetails?: (requestId: string) => void;
}

export const VacationRequestsList: React.FC<VacationRequestsListProps> = ({ onViewDetails }) => {
  const { 
    vacationRequests, 
    approveVacationRequest, 
    rejectVacationRequest 
  } = useVacation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRequests = vacationRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: VacationRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600">Rejeitada</Badge>;
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

  const handleApprove = (id: string) => {
    approveVacationRequest(id, 'Admin');
  };

  const handleReject = (id: string) => {
    const reason = prompt('Motivo da rejeição:');
    if (reason) {
      rejectVacationRequest(id, reason, 'Admin');
    }
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
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovada</SelectItem>
                <SelectItem value="rejected">Rejeitada</SelectItem>
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
                <div className="flex items-center justify-between">
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
                          {format(new Date(request.startDate), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                          {format(new Date(request.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Dias:</span>
                        <p>{request.days} dias</p>
                      </div>
                      <div>
                        <span className="font-medium">Solicitado em:</span>
                        <p>{format(new Date(request.requestDate), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-sm text-gray-600">Motivo:</span>
                      <p className="text-sm">{request.reason}</p>
                    </div>

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-sm text-red-800">Motivo da rejeição:</span>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(request.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    )}

                    {/* View Details Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails && onViewDetails(request.id)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
