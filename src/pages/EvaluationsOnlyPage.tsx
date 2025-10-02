import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Home, ChevronRight, Star, RefreshCw, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Evaluation } from '@/types/evaluation';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { CompactStatsCards } from '@/components/evaluations/CompactStatsCards';
import { SmartFilters } from '@/components/evaluations/SmartFilters';
import { NewEvaluationDialog } from '@/components/evaluations/NewEvaluationDialog';
import { EditEvaluationDialog } from '@/components/evaluations/EditEvaluationDialog';
import ViewEvaluationDialog from '@/components/evaluation/ViewEvaluationDialog';
import { RateEvaluationDialog } from '@/components/evaluations/RateEvaluationDialog';

export function EvaluationsOnlyPage() {
  const { evaluations, isLoading: loading, refreshEvaluations } = useEvaluations();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [selectedDateRange, setSelectedDateRange] = React.useState('');
  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [showViewDialog, setShowViewDialog] = React.useState(false);
  const [showRateDialog, setShowRateDialog] = React.useState(false);

  const [selectedEvaluation, setSelectedEvaluation] = React.useState<Evaluation | null>(null);

  // Filter out Coffee Connection evaluations
  const regularEvaluations = React.useMemo(() => {
    return evaluations.filter(evaluation => evaluation.type !== 'Coffee Connection');
  }, [evaluations]);

  // Handle evaluation deletion with confirmation
  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta avaliação?')) {
      return;
    }
    
    try {
      const { deleteEvaluation } = useEvaluations();
      await deleteEvaluation(id);
      toast({
        title: "Avaliação removida",
        description: "A avaliação foi removida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover avaliação",
        description: "Ocorreu um erro ao tentar remover a avaliação. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle evaluation update (only update local state, service call already done)
  const handleUpdateEvaluation = (updatedEvaluation: Evaluation) => {
    // O contexto já gerencia o estado, não precisamos fazer nada aqui
  };

  // Handle rate evaluation
  const handleRateEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowRateDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Concluída': 'bg-green-100 text-green-800',
      'Em Andamento': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    return 'bg-blue-100 text-blue-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter evaluations based on search criteria
  const filteredEvaluations = React.useMemo(() => {
    return regularEvaluations.filter(evaluation => {
      const matchesSearch = !searchTerm || 
        (evaluation.employee && evaluation.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evaluation.type && evaluation.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evaluation.period && evaluation.period.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEmployee = !selectedEmployee || evaluation.employee === selectedEmployee;
      const matchesUnit = !selectedUnit || evaluation.unit === selectedUnit;
      const matchesType = !selectedType || evaluation.type === selectedType;
      const matchesStatus = !selectedStatus || evaluation.status === selectedStatus;
      
      // Date range filtering
      let matchesDateRange = true;
      if (selectedDateRange && evaluation.date) {
        const evalDate = new Date(evaluation.date);
        const now = new Date();
        
        switch (selectedDateRange) {
          case 'today':
            matchesDateRange = evalDate.toDateString() === now.toDateString();
            break;
          case 'week': {
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            matchesDateRange = evalDate >= weekStart && evalDate <= weekEnd;
            break;
          }
          case 'month':
            matchesDateRange = evalDate.getMonth() === now.getMonth() && evalDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3);
            const evalQuarter = Math.floor(evalDate.getMonth() / 3);
            matchesDateRange = evalQuarter === quarter && evalDate.getFullYear() === now.getFullYear();
            break;
          }
        }
      }
      
      return matchesSearch && matchesEmployee && matchesUnit && matchesType && matchesStatus && matchesDateRange;
    });
  }, [regularEvaluations, searchTerm, selectedEmployee, selectedUnit, selectedType, selectedStatus, selectedDateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600">Reuniões</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">Avaliações</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-blue-600" />
            Avaliações de Desempenho
          </h1>
          <p className="text-muted-foreground">
            Gerencie avaliações formais de desempenho dos colaboradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={refreshEvaluations}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Compact Statistics - Only for regular evaluations */}
      <CompactStatsCards />

      {/* Smart Filters - Exclude Coffee Connection types */}
      <SmartFilters
        evaluations={regularEvaluations}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedLocation="" // Not used for regular evaluations
        onLocationChange={() => {}} // No-op
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        hideLocationFilter={true} // Hide location filter for regular evaluations
      />

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Lista de Avaliações de Desempenho
          </CardTitle>
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
                  <TableCell>
                    <Badge variant="outline">
                      {evaluation.unit || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(evaluation.type)}>
                      {evaluation.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{evaluation.period}</TableCell>
                  <TableCell>
                    <span className={getScoreColor(evaluation.score || 0)}>
                      {evaluation.score ? evaluation.score.toFixed(1) : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(evaluation.status)}>
                      {evaluation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {evaluation.date 
                      ? new Date(evaluation.date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEvaluation(evaluation);
                          setShowViewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEvaluation(evaluation);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {evaluation.status !== 'Concluída' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateEvaluation(evaluation)}
                          title="Dar nota e concluir avaliação"
                        >
                          <Star className="h-4 w-4 text-yellow-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvaluation(evaluation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        open={showNewDialog} 
        onOpenChange={setShowNewDialog}
      />
      
      {selectedEvaluation && (
        <>
          <EditEvaluationDialog 
            open={showEditDialog} 
            onOpenChange={setShowEditDialog}
            evaluation={selectedEvaluation}
            onEvaluationUpdated={handleUpdateEvaluation}
          />
          
          <ViewEvaluationDialog 
            open={showViewDialog} 
            onOpenChange={setShowViewDialog}
            evaluation={selectedEvaluation}
          />
          
          <RateEvaluationDialog 
            open={showRateDialog} 
            onOpenChange={setShowRateDialog}
            evaluation={selectedEvaluation}
            onEvaluationRated={handleUpdateEvaluation}
          />
        </>
      )}
     </div>
   );
}

export default EvaluationsOnlyPage;