
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, AlertCircle } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface NeutralsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NeutralsModal: React.FC<NeutralsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { responses, stats } = useNPS();
  
  const neutrals = responses.filter(response => response.category === 'neutro');
  const averageScore = neutrals.length > 0 
    ? (neutrals.reduce((sum, n) => sum + n.score, 0) / neutrals.length).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-600" />
            Análise dos Neutros ({stats.neutrals}%)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Estatísticas dos Neutros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Neutros</p>
                    <p className="text-2xl font-bold text-yellow-600">{neutrals.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nota Média</p>
                    <p className="text-2xl font-bold text-yellow-600">{averageScore}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">% do Total</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.neutrals}%</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-600">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Neutros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Colaboradores Neutros</h3>
            {neutrals.map((neutral) => (
              <Card key={neutral.id} className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{neutral.employeeName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{neutral.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(neutral.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Nota {neutral.score}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}

            {neutrals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum colaborador neutro encontrado no período atual</p>
              </div>
            )}
          </div>

          {/* Oportunidades de Melhoria */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Oportunidades de Conversão</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <p className="text-sm">Neutros são mais propensos a se tornarem promotores</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">Nota média: {averageScore} - próximo do limite promotor (9+)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <p className="text-sm">Foque em melhorias específicas mencionadas nos comentários</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <p className="text-sm">Considere conversas individuais para entender necessidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
