
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Coffee } from 'lucide-react';
import { useEvaluations } from '@/contexts/EvaluationContext';
import { EvaluationStatsModal } from './EvaluationStatsModal';
import { CompletedEvaluationsModal } from './CompletedEvaluationsModal';
import { CoffeeConnectionStatsModal } from './CoffeeConnectionStatsModal';
import { AverageScoreModal } from './AverageScoreModal';

export const InteractiveStatsCards: React.FC = () => {
  const { evaluations } = useEvaluations();
  const [openModal, setOpenModal] = useState<string | null>(null);

  // Calculate stats
  const totalEvaluations = evaluations.length;
  const completedEvaluations = evaluations.filter(e => e.status === 'Concluída').length;
  const coffeeConnections = evaluations.filter(e => e.type === 'Coffee Connection').length;
  const averageScore = evaluations.length > 0 
    ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length 
    : 0;

  const handleCardClick = (modalType: string) => {
    setOpenModal(modalType);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('total')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
                <p className="text-2xl font-bold">{totalEvaluations}</p>
                <p className="text-xs text-blue-600 mt-1">Clique para detalhes</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('completed')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{completedEvaluations}</p>
                <p className="text-xs text-green-600 mt-1">Clique para detalhes</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('coffee')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Coffee Connection</p>
                <p className="text-2xl font-bold text-amber-600">{coffeeConnections}</p>
                <p className="text-xs text-amber-600 mt-1">Clique para detalhes</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('average')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nota Média</p>
                <p className="text-2xl font-bold text-purple-600">{averageScore.toFixed(1)}</p>
                <p className="text-xs text-purple-600 mt-1">Clique para detalhes</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
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
      
      <CoffeeConnectionStatsModal
        open={openModal === 'coffee'}
        onOpenChange={(open) => !open && setOpenModal(null)}
        evaluations={evaluations.filter(e => e.type === 'Coffee Connection')}
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
