import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Eye, Edit, Calendar, Star } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { NewEvaluationDialog } from '@/components/evaluations/NewEvaluationDialog';

const EvaluationsPage: React.FC = () => {
  const { evaluations } = useEvaluations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isNewEvaluationDialogOpen, setIsNewEvaluationDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      'Concluída': 'bg-green-100 text-green-800',
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Em Andamento': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate stats
  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída').length;
  const pendingEvaluations = evaluations.filter(e => e.status === 'Pendente').length;
  const averageScore = evaluations.length > 0 
    ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-600 mt-1">Gestão de feedbacks e avaliações de desempenho</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Ciclo 2024-T1
          </Button>
          <Button size="sm" onClick={() => setIsNewEvaluationDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
                <p className="text-2xl font-bold">{totalEvaluations}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedEvaluations}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingEvaluations}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-purple-600">{averageScore.toFixed(1)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
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
                  placeholder="Buscar por colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                <option value="all">Todas as Unidades</option>
                <option value="centro">Centro</option>
                <option value="zona-sul">Zona Sul</option>
                <option value="norte">Norte</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos os Tipos</option>
                <option value="360">Avaliação 360°</option>
                <option value="auto">Auto Avaliação</option>
                <option value="gestor">Avaliação do Gestor</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="concluida">Concluída</option>
                <option value="pendente">Pendente</option>
                <option value="andamento">Em Andamento</option>
              </select>

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.employee}</TableCell>
                  <TableCell>{evaluation.role}</TableCell>
                  <TableCell>{evaluation.unit}</TableCell>
                  <TableCell>{evaluation.type}</TableCell>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${getScoreColor(evaluation.score)}`}>
                      {evaluation.score.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(evaluation.status)}>
                      {evaluation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(evaluation.date).toLocaleDateString('pt-BR')}</TableCell>
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

      {/* New Evaluation Dialog */}
      <NewEvaluationDialog
        open={isNewEvaluationDialogOpen}
        onOpenChange={setIsNewEvaluationDialogOpen}
      />
    </div>
  );
};

export default EvaluationsPage;
