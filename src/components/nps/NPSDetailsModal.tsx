
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface NPSDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NPSDetailsModal: React.FC<NPSDetailsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { stats } = useNPS();
  
  const scoreChange = stats.currentScore - stats.previousScore;
  const isPositive = scoreChange > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do NPS - Análise Completa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Score Principal */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Score NPS Atual</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-green-600">+{stats.currentScore}</span>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(scoreChange)} pontos vs mês anterior
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 mb-2">Excelente</Badge>
                  <p className="text-sm text-gray-600">Classificação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Promotores</p>
                    <p className="text-2xl font-bold text-green-600">{stats.promoters}%</p>
                    <p className="text-xs text-gray-500">Notas 9-10</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Neutros</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.neutrals}%</p>
                    <p className="text-xs text-gray-500">Notas 7-8</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Detratores</p>
                    <p className="text-2xl font-bold text-red-600">{stats.detractors}%</p>
                    <p className="text-xs text-gray-500">Notas 0-6</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Taxa de Resposta</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${stats.responseRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{stats.responseRate}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalResponses} de 27 colaboradores responderam
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Benchmark de Mercado</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Seu NPS</span>
                    <span className="font-medium text-green-600">+{stats.currentScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Média do Setor</span>
                    <span className="font-medium">+42</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Empresas Excelentes</span>
                    <span className="font-medium">+50+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Insights e Recomendações</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <p className="text-sm">Excelente evolução: +7 pontos em relação ao mês anterior</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">Taxa de resposta acima da média (85% vs 70% típico)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <p className="text-sm">Foco em converter neutros: 13% podem se tornar promotores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
