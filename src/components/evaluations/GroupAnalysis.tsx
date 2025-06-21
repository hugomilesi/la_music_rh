
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Evaluation } from '@/types/evaluation';

interface GroupAnalysisProps {
  evaluations: Evaluation[];
  groupBy: 'unit' | 'type' | 'period';
  onGroupByChange: (groupBy: 'unit' | 'type' | 'period') => void;
}

export const GroupAnalysis: React.FC<GroupAnalysisProps> = ({ evaluations, groupBy, onGroupByChange }) => {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Análise por Grupo</h3>
        <select 
          className="px-3 py-2 border border-gray-200 rounded-md text-sm"
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as 'unit' | 'type' | 'period')}
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
  );
};
