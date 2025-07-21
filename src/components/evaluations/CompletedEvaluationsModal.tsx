
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
import { Star, Edit, Coffee, Lock } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface CompletedEvaluationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluations: Evaluation[];
}

export const CompletedEvaluationsModal: React.FC<CompletedEvaluationsModalProps> = ({
  open,
  onOpenChange,
  evaluations
}) => {
  const { canManageEvaluations } = usePermissions();
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  const getSortedEvaluations = () => {
    const sorted = [...evaluations];
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => b.score - a.score);
      case 'name':
        return sorted.sort((a, b) => a.employee.localeCompare(b.employee));
      case 'date':
      default:
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeBadge = (type: string) => {
    if (type === 'Coffee Connection') {
      return 'bg-amber-100 text-amber-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const averageScore = evaluations.length > 0 
    ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length 
    : 0;

  const sortedEvaluations = getSortedEvaluations();

  // Verificação de permissão
  if (!canManageEvaluations) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Acesso Negado
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Você não tem permissão para visualizar avaliações concluídas.
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-green-600" />
            Avaliações Concluídas ({evaluations.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{evaluations.length}</p>
                <p className="text-sm text-gray-600">Total Concluídas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{averageScore.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Nota Média</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {evaluations.filter(e => e.type === 'Coffee Connection').length}
                </p>
                <p className="text-sm text-gray-600">Coffee Connection</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
            >
              <option value="date">Ordenar por Data</option>
              <option value="score">Ordenar por Nota</option>
              <option value="name">Ordenar por Nome</option>
            </select>
          </div>

          {/* Evaluations List */}
          <div className="space-y-3">
            {sortedEvaluations.map((evaluation) => (
              <Card key={evaluation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{evaluation.employee}</h4>
                        <Badge className={getTypeBadge(evaluation.type)}>
                          {evaluation.type === 'Coffee Connection' && <Coffee className="w-3 h-3 mr-1" />}
                          {evaluation.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{evaluation.role} - {evaluation.unit}</p>
                      <p className="text-sm text-gray-500">Período: {evaluation.period}</p>
                      {evaluation.comments && (
                        <p className="text-sm text-gray-600 mt-1 italic">"{evaluation.comments}"</p>
                      )}
                      {evaluation.type === 'Coffee Connection' && evaluation.topics && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Tópicos: {evaluation.topics.join(', ')}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                          {evaluation.score.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(evaluation.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
