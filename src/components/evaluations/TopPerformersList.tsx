
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Evaluation } from '@/types/evaluation';
import { Edit } from 'lucide-react';

interface TopPerformersListProps {
  evaluations: Evaluation[];
}

export const TopPerformersList: React.FC<TopPerformersListProps> = ({ evaluations }) => {
  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída' && e.type !== 'Coffee Connection');
  
  const topPerformers = completedEvaluations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

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

  return (
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
  );
};
