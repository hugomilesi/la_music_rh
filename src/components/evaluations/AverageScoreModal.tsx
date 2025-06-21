
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
import { Star, Edit } from 'lucide-react';

interface AverageScoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluations: Evaluation[];
  averageScore: number;
}

export const AverageScoreModal: React.FC<AverageScoreModalProps> = ({
  open,
  onOpenChange,
  evaluations,
  averageScore
}) => {
  const [groupBy, setGroupBy] = useState<'unit' | 'type' | 'period'>('unit');

  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída' && e.type !== 'Coffee Connection');

  const getGroupedData = () => {
    const grouped: { [key: string]: Evaluation[] } = {};
    
    completedEvaluations.forEach(evaluation => {
      let key: string;
      switch (groupBy) {
        case 'unit':
          key = evaluation.unit;
          break;
        case 'type':
          key = evaluation.type;
          break;
        case 'period':
          key = evaluation.period;
          break;
        default:
          key = evaluation.unit;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(evaluation);
    });
    
    return Object.entries(grouped).map(([key, evals]) => ({
      group: key,
      evaluations: evals,
      average: evals.reduce((sum, e) => sum + e.score, 0) / evals.length,
      count: evals.length
    })).sort((a, b) => b.average - a.average);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excelente';
    if (score >= 4.0) return 'Muito Bom';
    if (score >= 3.5) return 'Bom';
    if (score >= 3.0) return 'Regular';
    return 'Precisa Melhorar';
  };

  const groupedData = getGroupedData();

  const scoreDistribution = {
    excellent: completedEvaluations.filter(e => e.score >= 4.5).length,
    good: completedEvaluations.filter(e => e.score >= 3.5 && e.score < 4.5).length,
    regular: completedEvaluations.filter(e => e.score >= 3.0 && e.score < 3.5).length,
    poor: completedEvaluations.filter(e => e.score < 3.0).length,
  };

  const topPerformers = completedEvaluations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            Análise de Notas - Média Geral: {averageScore.toFixed(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Distribution */}
          <div>
            <h3 className="font-semibold mb-4">Distribuição de Notas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{scoreDistribution.excellent}</p>
                  <p className="text-sm text-gray-600">Excelente (4.5+)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{scoreDistribution.good}</p>
                  <p className="text-sm text-gray-600">Bom (3.5-4.4)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-orange-600">{scoreDistribution.regular}</p>
                  <p className="text-sm text-gray-600">Regular (3.0-3.4)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{scoreDistribution.poor}</p>
                  <p className="text-sm text-gray-600">Baixo (&lt;3.0)</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <h3 className="font-semibold mb-4">Melhores Avaliações</h3>
            <div className="space-y-2">
              {topPerformers.map((evaluation, index) => (
                <Card key={evaluation.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{evaluation.employee}</p>
                          <p className="text-sm text-gray-600">{evaluation.type} - {evaluation.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">{getScoreLabel(evaluation.score)}</p>
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

          {/* Group Analysis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Análise por Grupo</h3>
              <select 
                className="px-3 py-2 border border-gray-200 rounded-md text-sm"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'unit' | 'type' | 'period')}
              >
                <option value="unit">Por Unidade</option>
                <option value="type">Por Tipo</option>
                <option value="period">Por Período</option>
              </select>
            </div>
            
            <div className="space-y-3">
              {groupedData.map((group) => (
                <Card key={group.group}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{group.group}</h4>
                        <p className="text-sm text-gray-600">{group.count} avaliações</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(group.average)}`}>
                          {group.average.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">{getScoreLabel(group.average)}</p>
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
