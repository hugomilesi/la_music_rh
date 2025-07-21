import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Filter, Search, Eye, Edit, AlertTriangle, FileText, Shield, TrendingUp, Clock, CheckCircle2, Archive, MoreVertical, Trash2, FileSpreadsheet } from 'lucide-react';
import { useIncidents } from '@/contexts/IncidentsContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Incident } from '@/types/incident';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { NewIncidentDialog } from '@/components/incidents/NewIncidentDialog';
import { EditIncidentDialog } from '@/components/incidents/EditIncidentDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const IncidentsPage: React.FC = () => {
  const { incidents, loading, stats, refreshIncidents, deleteIncident, updateIncident } = useIncidents();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [newIncidentDialogOpen, setNewIncidentDialogOpen] = useState(false);
  const [selectedCardFilter, setSelectedCardFilter] = useState<string | null>(null);

  useEffect(() => {
    refreshIncidents();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const severityColors = {
      'baixa': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'media': 'bg-orange-100 text-orange-800 border-orange-300',
      'alta': 'bg-red-100 text-red-800 border-red-300',
      'critica': 'bg-red-200 text-red-900 border-red-400'
    };
    return severityColors[severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'aberto': 'bg-red-100 text-red-800 border-red-300',
      'em_andamento': 'bg-blue-100 text-blue-800 border-blue-300',
      'resolvido': 'bg-green-100 text-green-800 border-green-300',
      'cancelado': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await deleteIncident(id);
      toast.success('Ocorrência excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir ocorrência');
    }
    setDeleteDialogOpen(false);
    setIncidentToDelete(null);
  };

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = ['Data', 'Colaborador', 'Tipo', 'Gravidade', 'Status', 'Descrição', 'Responsável'];
    const csvContent = [
      headers.join(','),
      ...filteredIncidents.map(incident => [
        new Date(incident.incidentDate).toLocaleDateString('pt-BR'),
        incident.employeeName || '',
        incident.type,
        incident.severity === 'baixa' ? 'Baixa' : incident.severity === 'media' ? 'Média' : 'Alta',
        incident.status === 'aberto' ? 'Aberto' : incident.status === 'em_andamento' ? 'Em Andamento' : 'Resolvido',
        `"${incident.description.replace(/"/g, '""')}"`,
        incident.reporter || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ocorrencias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Relatório exportado com sucesso.');
  };

  const handleUpdateStatus = async (id: string, status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado') => {
    try {
      await updateIncident(id, { status });
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailsDialogOpen(true);
  };

  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setEditDialogOpen(true);
  };

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmployee = selectedEmployee === '' || incident.employeeId === selectedEmployee;
    const matchesSeverity = selectedSeverity === 'all' || incident.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
    
    // Apply card filter if selected
    let matchesCardFilter = true;
    if (selectedCardFilter === 'active') {
      matchesCardFilter = incident.status === 'aberto' || incident.status === 'em_andamento';
    } else if (selectedCardFilter === 'resolved') {
      matchesCardFilter = incident.status === 'resolvido';
    } else if (selectedCardFilter === 'thisMonth') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const incidentDate = new Date(incident.incidentDate);
      matchesCardFilter = incidentDate.getMonth() === currentMonth && incidentDate.getFullYear() === currentYear;
    }
    
    return matchesSearch && matchesEmployee && matchesSeverity && matchesStatus && matchesCardFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ocorrências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header - Título da sessão, botão de relatório e nova ocorrência */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ocorrências</h1>
              <p className="text-gray-600 mt-1">Registro e gestão de ocorrências disciplinares</p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={() => setReportsDialogOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Relatório
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportToExcel}
                disabled={filteredIncidents.length === 0}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
              <Button 
                size="sm"
                onClick={() => setNewIncidentDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Ocorrência
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de total de ocorrências, ativas, resolvidas e este mês */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedCardFilter === null ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCardFilter(selectedCardFilter === null ? 'total' : null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Ocorrências</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedCardFilter === 'active' ? 'ring-2 ring-red-500 bg-red-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCardFilter(selectedCardFilter === 'active' ? null : 'active')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.active || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedCardFilter === 'resolved' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCardFilter(selectedCardFilter === 'resolved' ? null : 'resolved')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolvidas</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.resolved || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`hover:shadow-md transition-all cursor-pointer ${
              selectedCardFilter === 'thisMonth' ? 'ring-2 ring-orange-500 bg-orange-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedCardFilter(selectedCardFilter === 'thisMonth' ? null : 'thisMonth')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.thisMonth || 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros de busca por nome de colaboradores, filtro de gravidades, filtro os status */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Filtros e Pesquisa</h3>
            <p className="text-sm text-gray-500">Use os filtros abaixo para encontrar ocorrências específicas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por tipo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
              />
            </div>
            
            <Combobox
              options={[
                { value: '', label: 'Todos os colaboradores' },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: employee.name,
                }))
              ]}
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
              placeholder="Filtrar por colaborador"
              searchPlaceholder="Buscar colaborador..."
              emptyText="Nenhum colaborador encontrado."
              className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
            />
            
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                <SelectValue placeholder="Filtrar por gravidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as gravidades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Ocorrências */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Ocorrências</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredIncidents.length} ocorrência(s) encontrada(s)</p>
          </div>
          
          {filteredIncidents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ocorrência encontrada</h4>
              <p className="text-gray-500">Tente ajustar os filtros ou adicionar uma nova ocorrência.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {incident.employeeName || 'N/A'}
                      </TableCell>
                      <TableCell>{incident.type}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadge(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(incident.status)}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(incident.incidentDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {incident.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewIncident(incident)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditIncident(incident)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {incident.status === 'aberto' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(incident.id, 'em_andamento')}>
                                <Clock className="w-4 h-4 mr-2" />
                                Marcar Em Andamento
                              </DropdownMenuItem>
                            )}
                            {(incident.status === 'aberto' || incident.status === 'em_andamento') && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(incident.id, 'resolvido')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar como Resolvido
                              </DropdownMenuItem>
                            )}
                            {incident.status !== 'cancelado' && incident.status !== 'resolvido' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(incident.id, 'cancelado')}>
                                <Archive className="w-4 h-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => {
                                setIncidentToDelete(incident.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => incidentToDelete && handleDeleteIncident(incidentToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Colaborador</label>
                  <p className="text-sm text-gray-900">{selectedIncident.employee || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-sm text-gray-900">{selectedIncident.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gravidade</label>
                  <Badge className={getSeverityBadge(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={getStatusBadge(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data da Ocorrência</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(selectedIncident.incidentDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-900 mt-1">{selectedIncident.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setDetailsDialogOpen(false);
              selectedIncident && handleEditIncident(selectedIncident);
            }}>
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Relatórios */}
      <Dialog open={reportsDialogOpen} onOpenChange={setReportsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relatórios de Ocorrências</DialogTitle>
            <DialogDescription>
              Gere relatórios detalhados sobre as ocorrências registradas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Funcionalidade de relatórios em desenvolvimento.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Incident Dialog */}
      <NewIncidentDialog 
        open={newIncidentDialogOpen}
        onOpenChange={setNewIncidentDialogOpen}
      />

      {/* Edit Incident Dialog */}
      <EditIncidentDialog 
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        incident={selectedIncident}
      />
    </div>
  );
};

export default IncidentsPage;