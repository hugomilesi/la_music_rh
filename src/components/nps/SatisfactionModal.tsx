
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, User, Heart } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface SatisfactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SatisfactionModal: React.FC<SatisfactionModalProps> = ({
  open,
  onOpenChange
}) => {
  const { responses, stats } = useNPS();
  
  const satisfiedResponses = responses.filter(response => response.category === 'satisfeito');
  const averageScore = satisfiedResponses.length > 0 
    ? (satisfiedResponses.reduce((sum, s) => sum + s.score, 0) / satisfiedResponses.length).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-blue-600" />
            Análise dos Satisfeitos ({stats.satisfied || 0}%)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Estatísticas dos Satisfeitos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Satisfeitos</p>
                    <p className="text-2xl font-bold text-blue-600">{satisfiedResponses.length}</p>
                  </div>
                  <Smile className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nota Média</p>
                    <p className="text-2xl font-bold text-blue-600">{averageScore}</p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">% do Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.satisfied || 0}%</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Satisfeitos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Colaboradores Satisfeitos</h3>
            {satisfiedResponses.map((satisfied) => (
              <Card key={satisfied.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{satisfied.employeeName}</h4>
                        {satisfied.department && (
                          <p className="text-xs text-gray-500">{satisfied.department}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{satisfied.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(satisfied.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Nota {satisfied.score}/5
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {satisfiedResponses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Smile className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhuma resposta de satisfação encontrada no período atual</p>
              </div>
            )}
          </div>

          {/* Insights */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Insights de Satisfação</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">Satisfeitos representam {stats.satisfied || 0}% da equipe</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <p className="text-sm">Nota média: {averageScore}/5 (alto nível de satisfação)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <p className="text-sm">Continue mantendo as práticas que geram satisfação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
