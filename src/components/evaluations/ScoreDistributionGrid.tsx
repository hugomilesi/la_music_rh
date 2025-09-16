
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Evaluation } from '@/types/evaluation';

interface ScoreDistributionGridProps {
  evaluations: Evaluation[];
}

export const ScoreDistributionGrid: React.FC<ScoreDistributionGridProps> = ({ evaluations }) => {
  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída' && e.type !== 'Coffee Connection' && e.score > 0);

  const scoreDistribution = {
    excellent: completedEvaluations.filter(e => e.score >= 4.5).length,
    good: completedEvaluations.filter(e => e.score >= 3.5 && e.score < 4.5).length,
    regular: completedEvaluations.filter(e => e.score >= 3.0 && e.score < 3.5).length,
    poor: completedEvaluations.filter(e => e.score < 3.0).length,
  };

  return (
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
  );
};
