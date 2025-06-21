
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Evaluation } from '@/types/evaluation';
import { Star } from 'lucide-react';
import { ScoreDistributionGrid } from './ScoreDistributionGrid';
import { TopPerformersList } from './TopPerformersList';
import { GroupAnalysis } from './GroupAnalysis';

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
          <ScoreDistributionGrid evaluations={evaluations} />
          <TopPerformersList evaluations={evaluations} />
          <GroupAnalysis 
            evaluations={evaluations} 
            groupBy={groupBy} 
            onGroupByChange={setGroupBy} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
