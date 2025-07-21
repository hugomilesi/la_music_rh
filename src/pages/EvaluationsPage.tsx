
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Filter, Search, Eye, Edit, Calendar, Coffee, Trash2 } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { NewEvaluationDialog } from '@/components/evaluations/NewEvaluationDialog';
import { CoffeeConnectionCard } from '@/components/evaluations/CoffeeConnectionCard';
import { CoffeeConnectionDialog } from '@/components/evaluations/CoffeeConnectionDialog';
import { InteractiveStatsCards } from '@/components/evaluations/InteractiveStatsCards';
import { CoffeeConnectionScheduleIntegration } from '@/components/evaluations/CoffeeConnectionScheduleIntegration';
import { EditEvaluationDialog } from '@/components/evaluations/EditEvaluationDialog';
import ViewEvaluationDialog from '@/components/evaluation/ViewEvaluationDialog';
import { Evaluation } from '@/types/evaluation';

const EvaluationsPage: React.FC = () => {
  console.log('EvaluationsPage: Component rendering...');
  
  const { evaluations, deleteEvaluation } = useEvaluations();
  console.log('EvaluationsPage: Retrieved evaluations:', evaluations);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isNewEvaluationDialogOpen, setIsNewEvaluationDialogOpen] = useState(false);
  const [isCoffeeConnectionDialogOpen, setIsCoffeeConnectionDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      'Concluída': 'bg-green-100 text-green-800',
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Em Andamento': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    if (type === 'Coffee Connection') {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleDeleteEvaluation = async (evaluation: Evaluation) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja remover a avaliação de ${evaluation.employee}?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmed) {
      try {
        await deleteEvaluation(evaluation.id);
      } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        alert('Erro ao remover a avaliação. Tente novamente.');
      }
    }
  };

  // Filter evaluations based on search and filter criteria
  const filteredEvaluations = evaluations.filter((evaluation) => {
    // Search filter
    const matchesSearch = evaluation.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Unit filter
    const matchesUnit = !selectedUnit || evaluation.unit === selectedUnit;
    
    // Type filter
    const matchesType = !selectedType || evaluation.type === selectedType;
    
    // Status filter
    const matchesStatus = !selectedStatus || evaluation.status === selectedStatus;
    
    // Employee filter
    const matchesEmployee = !selectedEmployee || evaluation.employee === selectedEmployee;
    
    return matchesSearch && matchesUnit && matchesType && matchesStatus && matchesEmployee;
  });

  console.log('EvaluationsPage: Rendering with evaluations:', evaluations.length, 'filtered:', filteredEvaluations.length);

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

      {/* Coffee Connection Card */}
      <CoffeeConnectionCard onScheduleNew={() => setIsCoffeeConnectionDialogOpen(true)} />

      {/* Interactive Stats Cards */}
      <InteractiveStatsCards />

      {/* Coffee Connection Schedule Integration */}
      <CoffeeConnectionScheduleIntegration />

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
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Todos os Colaboradores</option>
                {Array.from(new Set(evaluations.map(e => e.employee))).map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
              >
                <option value="">Todas as Unidades</option>
                <option value="Campo Grande">Campo Grande</option>
                <option value="Recreio">Recreio</option>
                <option value="Barra">Barra</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Todos os Tipos</option>
                <option value="Avaliação 360°">Avaliação 360°</option>
                <option value="Auto Avaliação">Auto Avaliação</option>
                <option value="Avaliação do Gestor">Avaliação do Gestor</option>
                <option value="Coffee Connection">Coffee Connection</option>
              </select>

              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="Concluída">Concluída</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Andamento">Em Andamento</option>
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
              {filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.employee}</TableCell>
                  <TableCell>{evaluation.role}</TableCell>
                  <TableCell>{evaluation.unit}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(evaluation.type)}>
                      {evaluation.type === 'Coffee Connection' && <Coffee className="w-3 h-3 mr-1" />}
                      {evaluation.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>
                    {evaluation.type === 'Coffee Connection' && evaluation.status === 'Pendente' ? (
                      <span className="text-gray-500">-</span>
                    ) : (
                      <span className={`font-bold ${getScoreColor(evaluation.score || 0)}`}>
                        {(evaluation.score || 0).toFixed(1)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(evaluation.status)}>
                      {evaluation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(evaluation.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setViewingEvaluation(evaluation)}
                        title="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingEvaluation(evaluation)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteEvaluation(evaluation)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewEvaluationDialog
        open={isNewEvaluationDialogOpen}
        onOpenChange={setIsNewEvaluationDialogOpen}
      />
      
      <CoffeeConnectionDialog
        open={isCoffeeConnectionDialogOpen}
        onOpenChange={setIsCoffeeConnectionDialogOpen}
      />

      <EditEvaluationDialog
        open={!!editingEvaluation}
        onOpenChange={(open) => !open && setEditingEvaluation(null)}
        evaluation={editingEvaluation}
      />

      <ViewEvaluationDialog
        open={!!viewingEvaluation}
        onOpenChange={(open) => !open && setViewingEvaluation(null)}
        evaluation={viewingEvaluation}
      />
    </div>
  );
};

export default EvaluationsPage;
