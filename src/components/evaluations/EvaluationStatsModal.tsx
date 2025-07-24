
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
import { Star, Edit, Coffee } from 'lucide-react';

interface EvaluationStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluations: Evaluation[];
}

export const EvaluationStatsModal: React.FC<EvaluationStatsModalProps> = ({
  open,
  onOpenChange,
  evaluations
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

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

  const filteredEvaluations = selectedPeriod === 'all' 
    ? evaluations 
    : evaluations.filter(e => e.period === selectedPeriod);

  const periods = [...new Set(evaluations.map(e => e.period))];

  const stats = {
    total: filteredEvaluations.length,
    completed: filteredEvaluations.filter(e => e.status === 'Concluída').length,
    pending: filteredEvaluations.filter(e => e.status === 'Pendente').length,
    inProgress: filteredEvaluations.filter(e => e.status === 'Em Andamento').length,
    byType: {
      '360': filteredEvaluations.filter(e => e.type === 'Avaliação 360°').length,
      'auto': filteredEvaluations.filter(e => e.type === 'Auto Avaliação').length,
      'manager': filteredEvaluations.filter(e => e.type === 'Avaliação do Gestor').length,
      'coffee': filteredEvaluations.filter(e => e.type === 'Coffee Connection').length,
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Detalhes das Avaliações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filter */}
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="all">Todos os Períodos</option>
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </CardContent>
            </Card>
          </div>

          {/* Type Distribution */}
          <div>
            <h3 className="font-semibold mb-4">Distribuição por Tipo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold">{stats.byType['360']}</p>
                  <p className="text-sm text-gray-600">360°</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold">{stats.byType.auto}</p>
                  <p className="text-sm text-gray-600">Auto Avaliação</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold">{stats.byType.manager}</p>
                  <p className="text-sm text-gray-600">Do Gestor</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xl font-bold text-amber-600">{stats.byType.coffee}</p>
                  <p className="text-sm text-gray-600">Coffee Connection</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Evaluations List */}
          <div>
            <h3 className="font-semibold mb-4">Avaliações Recentes</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEvaluations.slice(0, 10).map((evaluation) => (
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
                        <p className="text-sm text-gray-600">{evaluation.role}</p>
                        <p className="text-sm text-gray-500">{evaluation.period}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusBadge(evaluation.status)}>
                          {evaluation.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-bold">
                            {evaluation.type === 'Coffee Connection' && evaluation.status === 'Pendente' ? (
                              <span className="text-gray-500">-</span>
                            ) : (
                              <span className={evaluation.score >= 4.5 ? 'text-green-600' : evaluation.score >= 3.5 ? 'text-yellow-600' : 'text-red-600'}>
                                {evaluation.score.toFixed(1)}
                              </span>
                            )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
