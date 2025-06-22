
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Eye, Edit, AlertTriangle, FileText, Shield } from 'lucide-react';
import { useIncidents } from '@/contexts/IncidentsContext';
import { IncidentListModal } from '@/components/incidents/IncidentListModal';
import { NewIncidentDialog } from '@/components/incidents/NewIncidentDialog';
import { ReportsModal } from '@/components/incidents/ReportsModal';

const IncidentsPage: React.FC = () => {
  const { incidents, getFilteredIncidents } = useIncidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalData, setListModalData] = useState<{ incidents: any[], title: string }>({ incidents: [], title: '' });
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const getSeverityBadge = (severity: string) => {
    const variants = {
      'leve': 'bg-yellow-100 text-yellow-800',
      'moderado': 'bg-orange-100 text-orange-800',
      'grave': 'bg-red-100 text-red-800'
    };
    return variants[severity as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'ativo': 'bg-red-100 text-red-800',
      'resolvido': 'bg-green-100 text-green-800',
      'arquivado': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleCardClick = (filter: 'all' | 'active' | 'resolved' | 'thisMonth', title: string) => {
    const filteredIncidents = getFilteredIncidents(filter);
    setListModalData({ incidents: filteredIncidents, title });
    setListModalOpen(true);
  };

  // Filter incidents based on search and filters
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || incident.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ocorrências</h1>
          <p className="text-gray-600 mt-1">Registro e gestão de ocorrências disciplinares</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => setReportsOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button size="sm" onClick={() => setNewIncidentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ocorrência
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('all', 'Todas as Ocorrências')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Ocorrências</p>
                <p className="text-2xl font-bold">{incidents.length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('active', 'Ocorrências Ativas')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-red-600">{getFilteredIncidents('active').length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('resolved', 'Ocorrências Resolvidas')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolvidas</p>
                <p className="text-2xl font-bold text-green-600">{getFilteredIncidents('resolved').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleCardClick('thisMonth', 'Ocorrências deste Mês')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-orange-600">{getFilteredIncidents('thisMonth').length}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por colaborador ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
              >
                <option value="all">Todas as Gravidades</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="grave">Grave</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Ativas</option>
                <option value="resolvido">Resolvidas</option>
                <option value="arquivado">Arquivadas</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrências</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Gravidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.employee}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityBadge(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{incident.description}</TableCell>
                  <TableCell>{new Date(incident.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{incident.reporter}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(incident.status)}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      <IncidentListModal
        open={listModalOpen}
        onOpenChange={setListModalOpen}
        incidents={listModalData.incidents}
        title={listModalData.title}
      />

      <NewIncidentDialog
        open={newIncidentOpen}
        onOpenChange={setNewIncidentOpen}
      />

      <ReportsModal
        open={reportsOpen}
        onOpenChange={setReportsOpen}
      />
    </div>
  );
};

export default IncidentsPage;
