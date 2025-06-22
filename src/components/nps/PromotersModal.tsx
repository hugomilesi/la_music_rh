
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, User, Star } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface PromotersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PromotersModal: React.FC<PromotersModalProps> = ({
  open,
  onOpenChange
}) => {
  const { responses, stats } = useNPS();
  
  const promoters = responses.filter(response => response.category === 'promotor');
  const averageScore = promoters.length > 0 
    ? (promoters.reduce((sum, p) => sum + p.score, 0) / promoters.length).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Análise dos Promotores ({stats.promoters}%)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Estatísticas dos Promotores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Promotores</p>
                    <p className="text-2xl font-bold text-green-600">{promoters.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nota Média</p>
                    <p className="text-2xl font-bold text-green-600">{averageScore}</p>
                  </div>
                  <Star className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">% do Total</p>
                    <p className="text-2xl font-bold text-green-600">{stats.promoters}%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Promotores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Promotores Individuais</h3>
            {promoters.map((promoter) => (
              <Card key={promoter.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{promoter.employeeName}</h4>
                        {promoter.department && (
                          <p className="text-xs text-gray-500">{promoter.department}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{promoter.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(promoter.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Nota {promoter.score}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {promoters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum promotor encontrado no período atual</p>
              </div>
            )}
          </div>

          {/* Insights */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Insights dos Promotores</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <p className="text-sm">Promotores representam {stats.promoters}% da equipe</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">Nota média: {averageScore} (excelente engajamento)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <p className="text-sm">Aproveite para identificar embaixadores da marca</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
