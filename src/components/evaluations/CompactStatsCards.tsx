import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { EvaluationStatsModal } from './EvaluationStatsModal';
import { CompletedEvaluationsModal } from './CompletedEvaluationsModal';
import { AverageScoreModal } from './AverageScoreModal';

export const CompactStatsCards: React.FC = () => {
  const { evaluations } = useEvaluations();
  const [openModal, setOpenModal] = useState<string | null>(null);

  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída').length;
  const inProgressEvaluations = evaluations.filter(e => e.status === 'Em Andamento').length;
  const averageScore = evaluations.length > 0 
    ? evaluations.reduce((sum, e) => sum + (e.score || 0), 0) / evaluations.length 
    : 0;

  const completionRate = totalEvaluations > 0 
    ? Math.round((completedEvaluations / totalEvaluations) * 100) 
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Evaluations */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOpenModal('total')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalEvaluations}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            {inProgressEvaluations > 0 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  {inProgressEvaluations} em andamento
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Evaluations */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOpenModal('completed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{completedEvaluations}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className={`text-xs font-medium ${getCompletionRateColor(completionRate)}`}>
                  {completionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setOpenModal('average')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Média Geral</p>
              </div>
              <Star className={`w-8 h-8 ${getScoreColor(averageScore)}`} />
            </div>
            <div className="mt-2 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= averageScore
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {completionRate > 75 ? '+' : completionRate > 50 ? '=' : '-'}
                </p>
                <p className="text-sm text-gray-600">Tendência</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${
                completionRate > 75 ? 'text-green-600' : 
                completionRate > 50 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <div className="mt-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  completionRate > 75 ? 'text-green-600 border-green-200' : 
                  completionRate > 50 ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'
                }`}
              >
                {completionRate > 75 ? 'Excelente' : completionRate > 50 ? 'Bom' : 'Atenção'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EvaluationStatsModal
        open={openModal === 'total'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        evaluations={evaluations}
      />
      
      <CompletedEvaluationsModal
        open={openModal === 'completed'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        evaluations={evaluations.filter(e => e.status === 'Concluída')}
      />
      
      <AverageScoreModal
        open={openModal === 'average'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        evaluations={evaluations}
        averageScore={averageScore}
      />
    </>
  );
};

export default CompactStatsCards;