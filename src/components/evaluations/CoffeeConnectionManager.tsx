import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Coffee, Calendar, MapPin, Clock, CheckCircle, Edit, Star, Eye, Plus, Check } from 'lucide-react';
import { Evaluation } from '@/types/evaluation';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { useToast } from '@/hooks/use-toast';

interface CoffeeConnectionManagerProps {
  evaluations: Evaluation[];
  onScheduleNew: () => void;
  onViewEvaluation: (evaluation: Evaluation) => void;
  onEditEvaluation: (evaluation: Evaluation) => void;
  refreshEvents: () => Promise<void>;
}

export const CoffeeConnectionManager: React.FC<CoffeeConnectionManagerProps> = ({
  evaluations,
  onScheduleNew,
  onViewEvaluation,
  onEditEvaluation,
  refreshEvents
}) => {
  const { updateEvaluation } = useEvaluations();
  const { toast } = useToast();
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [score, setScore] = useState('');
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled');

  // Filter Coffee Connection evaluations by status
  const coffeeConnections = evaluations?.filter(evaluation => evaluation.type === 'Coffee Connection') || [];
  const scheduledSessions = coffeeConnections.filter(evaluation => evaluation.status === 'Em Andamento');
  const completedSessions = coffeeConnections.filter(evaluation => evaluation.status === 'Concluída');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluída':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApproveAndSchedule = async (evaluation: Evaluation) => {
    try {
      // Update evaluation status to 'Em Andamento'
      await updateEvaluation(evaluation.id, {
        status: 'Em Andamento'
      });

      // Atualizar eventos na agenda (a view schedule_events_with_evaluations já coleta os dados das avaliações)
      await refreshEvents();

      toast({
        title: 'Sucesso!',
        description: 'Coffee Connection aprovada e será exibida no calendário.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao aprovar Coffee Connection.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteWithScore = async () => {
    if (!selectedEvaluation || !score) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma nota válida.',
        variant: 'destructive',
      });
      return;
    }

    const scoreNumber = parseFloat(score);
    if (scoreNumber < 0 || scoreNumber > 10) {
      toast({
        title: 'Erro',
        description: 'A nota deve estar entre 0 e 10.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateEvaluation(selectedEvaluation.id, {
        status: 'Concluída',
        score: scoreNumber,
        completed_at: new Date().toISOString()
      });

      // Atualizar eventos na agenda
      await refreshEvents();

      toast({
        title: 'Sucesso!',
        description: 'Coffee Connection concluída com sucesso.',
      });

      setShowScoreDialog(false);
      setSelectedEvaluation(null);
      setScore('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao concluir Coffee Connection.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenScoreDialog = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowScoreDialog(true);
    setScore('');
  };

  const renderSessionCard = (evaluation: Evaluation, showActions: boolean = true) => (
    <Card key={evaluation.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{evaluation.employee}</h4>
              <Badge className={getStatusBadge(evaluation.status)}>
                {evaluation.status}
              </Badge>
              {evaluation.confidential && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  Confidencial
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{evaluation.role}</p>
            
            {evaluation.meetingDate && evaluation.meetingTime && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(evaluation.meetingDate).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {evaluation.meetingTime}
                </div>
                {evaluation.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {evaluation.location}
                  </div>
                )}
              </div>
            )}
            
            {evaluation.topics && evaluation.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {evaluation.topics.slice(0, 3).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {evaluation.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{evaluation.topics.length - 3} mais
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2 ml-4">

              {evaluation.status === 'Em Andamento' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenScoreDialog(evaluation)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  title="Concluir com nota"
                >
                  <Star className="w-4 h-4 text-yellow-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewEvaluation(evaluation)}
                title="Visualizar detalhes"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditEvaluation(evaluation)}
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getUpcomingSessions = () => {
    return scheduledSessions
      .filter(session => session.meetingDate && session.meetingTime)
      .filter(session => {
        const sessionDateTime = new Date(`${session.meetingDate}T${session.meetingTime}`);
        return sessionDateTime > new Date();
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.meetingDate}T${a.meetingTime}`);
        const dateB = new Date(`${b.meetingDate}T${b.meetingTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  };

  const upcomingSessions = getUpcomingSessions();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-600" />
          Coffee Connections
        </CardTitle>
        <Button 
          onClick={onScheduleNew} 
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agendar Nova Sessão
        </Button>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{coffeeConnections.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{scheduledSessions.length}</p>
            <p className="text-sm text-gray-600">Em Andamento</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
            <p className="text-sm text-gray-600">Concluídas</p>
          </div>
        </div>

        {/* Upcoming Sessions Preview */}
        {upcomingSessions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Próximas Sessões
            </h4>
            <div className="space-y-2">
              {upcomingSessions.map(session => renderSessionCard(session, false))}
            </div>
          </div>
        )}

        {/* Tabs for detailed view */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduled">
              Em Andamento ({scheduledSessions.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedSessions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="mt-4">
            {scheduledSessions.length > 0 ? (
              <div className="space-y-3">
                {scheduledSessions.map(session => renderSessionCard(session))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma sessão agendada</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            {completedSessions.length > 0 ? (
              <div className="space-y-3">
                {completedSessions.map(session => renderSessionCard(session))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Check className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma sessão concluída</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Score Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Concluir Coffee Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvaluation && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedEvaluation.employee}</p>
                <p className="text-sm text-gray-600">{selectedEvaluation.role}</p>
                {selectedEvaluation.meetingDate && (
                  <p className="text-sm text-gray-500">
                    {new Date(selectedEvaluation.meetingDate).toLocaleDateString('pt-BR')}
                    {selectedEvaluation.meetingTime && ` às ${selectedEvaluation.meetingTime}`}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="score">Nota da Avaliação (0-10)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Ex: 8.5"
              />
              <p className="text-xs text-gray-500">
                Insira uma nota de 0 a 10 para concluir esta Coffee Connection
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowScoreDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCompleteWithScore}
                disabled={!score}
              >
                Concluir Avaliação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CoffeeConnectionManager;