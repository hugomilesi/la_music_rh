import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Trash2, Coffee, Home, ChevronRight, Star, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Evaluation } from '@/types/evaluation';
import { useEvaluations } from '@/contexts/EvaluationContext';
import CoffeeConnectionManager from '@/components/evaluations/CoffeeConnectionManager';
import { SmartFilters } from '@/components/evaluations/SmartFilters';
import ViewEvaluationDialog from '@/components/evaluation/ViewEvaluationDialog';
import { RateEvaluationDialog } from '@/components/evaluations/RateEvaluationDialog';
import { CoffeeConnectionDialog } from '@/components/evaluations/CoffeeConnectionDialog';

export function CoffeeConnectionPage() {
  const { evaluations, isLoading: loading, refreshEvaluations } = useEvaluations();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [selectedUnit, setSelectedUnit] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('');
  const [selectedDateRange, setSelectedDateRange] = React.useState('');
  const [showViewDialog, setShowViewDialog] = React.useState(false);
  const [showRateDialog, setShowRateDialog] = React.useState(false);
  const [showCoffeeDialog, setShowCoffeeDialog] = React.useState(false);

  const [selectedEvaluation, setSelectedEvaluation] = React.useState<Evaluation | null>(null);

  // Filter only Coffee Connection evaluations
  const coffeeConnections = React.useMemo(() => {
    return evaluations.filter(evaluation => evaluation.type === 'Coffee Connection');
  }, [evaluations]);

  // Handle evaluation deletion with confirmation
  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este Coffee Connection?')) {
      return;
    }
    
    try {
      const { deleteEvaluation } = useEvaluations();
      await deleteEvaluation(id);
      toast({
        title: "Coffee Connection removido",
        description: "O Coffee Connection foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover Coffee Connection",
        description: "Ocorreu um erro ao tentar remover o Coffee Connection. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle evaluation update (only update local state, service call already done)
  const handleUpdateEvaluation = (updatedEvaluation: Evaluation) => {
    // O contexto já gerencia o estado, não precisamos fazer nada aqui
  };

  // Handle schedule new coffee connection
  const handleScheduleNew = () => {
    setShowCoffeeDialog(true);
  };

  // Handle view evaluation from coffee manager
  const handleViewEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowViewDialog(true);
  };

  // Handle edit evaluation from coffee manager
  const handleEditEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowViewDialog(true); // Using view dialog for now
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

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Filter coffee connections based on search criteria
  const filteredCoffeeConnections = React.useMemo(() => {
    return coffeeConnections.filter(evaluation => {
      const matchesSearch = !searchTerm || 
        (evaluation.employee && evaluation.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evaluation.period && evaluation.period.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEmployee = !selectedEmployee || evaluation.employee === selectedEmployee;
      const matchesUnit = !selectedUnit || evaluation.unit === selectedUnit;
      const matchesStatus = !selectedStatus || evaluation.status === selectedStatus;
      const matchesLocation = !selectedLocation || evaluation.location === selectedLocation;
      
      // Date range filtering for Coffee Connections
      let matchesDateRange = true;
      if (selectedDateRange && evaluation.meetingDate) {
        const meetingDate = new Date(evaluation.meetingDate);
        const now = new Date();
        
        switch (selectedDateRange) {
          case 'today':
            matchesDateRange = meetingDate.toDateString() === now.toDateString();
            break;
          case 'week': {
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
            matchesDateRange = meetingDate >= weekStart && meetingDate <= weekEnd;
            break;
          }
          case 'month':
            matchesDateRange = meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear();
            break;
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3);
            const evalQuarter = Math.floor(meetingDate.getMonth() / 3);
            matchesDateRange = evalQuarter === quarter && meetingDate.getFullYear() === now.getFullYear();
            break;
          }
        }
      }
      
      return matchesSearch && matchesEmployee && matchesUnit && matchesStatus && matchesLocation && matchesDateRange;
    });
  }, [coffeeConnections, searchTerm, selectedEmployee, selectedUnit, selectedStatus, selectedLocation, selectedDateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Coffee Connections...</p>
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
        <span className="font-medium text-gray-900">Coffee Connection</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Coffee className="h-8 w-8 text-amber-600" />
            Coffee Connection
          </h1>
          <p className="text-muted-foreground">
            Gerencie reuniões informais e conexões entre colaboradores
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
            onClick={() => setShowCoffeeDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Coffee Connection
          </Button>
        </div>
      </div>

      {/* Coffee Connection Manager */}
      <CoffeeConnectionManager
          evaluations={coffeeConnections}
          onViewEvaluation={handleViewEvaluation}
          onEditEvaluation={handleEditEvaluation}
          onScheduleNew={handleScheduleNew}
          refreshEvents={refreshEvaluations}
        />

      {/* Smart Filters - Only for Coffee Connections */}
      <SmartFilters
        evaluations={coffeeConnections}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        selectedType="Coffee Connection" // Fixed type
        onTypeChange={() => {}} // No-op since type is fixed
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        hideTypeFilter={true} // Hide type filter since it's fixed
      />

      {/* Coffee Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            Lista de Coffee Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoffeeConnections.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">{evaluation.employee}</TableCell>
                  <TableCell>{evaluation.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {evaluation.unit || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>{evaluation.location || '-'}</TableCell>
                  <TableCell>
                    {evaluation.meetingDate && evaluation.meetingTime
                      ? `${new Date(evaluation.meetingDate).toLocaleDateString('pt-BR')} às ${evaluation.meetingTime}`
                      : evaluation.meetingDate 
                        ? new Date(evaluation.meetingDate).toLocaleDateString('pt-BR')
                        : '-'
                    }
                  </TableCell>
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
                      {evaluation.status !== 'Concluída' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateEvaluation(evaluation)}
                          title="Dar nota e concluir Coffee Connection"
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
      {selectedEvaluation && (
        <>
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
      
      {/* Coffee Connection Dialog */}
       <CoffeeConnectionDialog 
         open={showCoffeeDialog} 
         onOpenChange={setShowCoffeeDialog}
         onSuccess={refreshEvaluations}
       />
     </div>
   );
}

export default CoffeeConnectionPage;