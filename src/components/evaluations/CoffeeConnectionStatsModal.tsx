
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Evaluation } from '@/types/evaluation';
import { Coffee, Calendar, Edit, Clock } from 'lucide-react';
interface CoffeeConnectionStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluations: Evaluation[];
}

export const CoffeeConnectionStatsModal: React.FC<CoffeeConnectionStatsModalProps> = ({
  open,
  onOpenChange,
  evaluations
}) => {
  const [viewMode, setViewMode] = useState<'scheduled' | 'completed'>('scheduled');

  const scheduledSessions = evaluations.filter(e => e.status === 'Em Andamento');
  const completedSessions = evaluations.filter(e => e.status === 'Concluída');

  const getStatusBadge = (status: string) => {
    const variants = {
      'Concluída': 'bg-green-100 text-green-800',
      'Em Andamento': 'bg-blue-100 text-blue-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const currentView = viewMode === 'scheduled' ? scheduledSessions : completedSessions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-600" />
            Coffee Connection ({evaluations.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{evaluations.length}</p>
                <p className="text-sm text-gray-600">Total de Sessões</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{scheduledSessions.length}</p>
                <p className="text-sm text-gray-600">Agendadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('scheduled')}
            >
              Agendadas ({scheduledSessions.length})
            </Button>
            <Button 
              variant={viewMode === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('completed')}
            >
              Concluídas ({completedSessions.length})
            </Button>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {currentView.map((evaluation) => (
              <Card key={evaluation.id}>
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
                      
                      <p className="text-sm text-gray-600 mb-1">{evaluation.role}</p>
                      
                      {evaluation.meetingDate && evaluation.meetingTime && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(evaluation.meetingDate).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {evaluation.meetingTime}
                          </div>
                        </div>
                      )}
                      
                      {evaluation.location && (
                        <p className="text-sm text-gray-600 mb-2">📍 {evaluation.location}</p>
                      )}
                      
                      {evaluation.topics && evaluation.topics.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Tópicos:</p>
                          <div className="flex flex-wrap gap-1">
                            {evaluation.topics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {evaluation.followUpActions && (
                        <div className="mt-2 p-2 bg-amber-50 rounded text-sm">
                          <p className="text-amber-800">
                            <strong>Ações:</strong> {evaluation.followUpActions}
                          </p>
                        </div>
                      )}
                      
                      {evaluation.comments && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{evaluation.comments}"</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {viewMode === 'completed' && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {evaluation.score.toFixed(1)}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {currentView.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {viewMode === 'scheduled' 
                ? 'Nenhuma sessão agendada' 
                : 'Nenhuma sessão concluída'
              }
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
