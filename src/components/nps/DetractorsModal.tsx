
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingDown, User, AlertTriangle, MessageSquare } from 'lucide-react';
import { useNPS } from '@/contexts/NPSContext';

interface DetractorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DetractorsModal: React.FC<DetractorsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { responses, stats } = useNPS();
  
  const detractors = responses.filter(response => response.category === 'detrator');
  const averageScore = detractors.length > 0 
    ? (detractors.reduce((sum, d) => sum + d.score, 0) / detractors.length).toFixed(1)
    : '0';

  const handleContactDetractor = (detractorName: string) => {
    // Iniciando contato com detrator
    // Aqui seria implementada a funcionalidade de contato
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Análise dos Detratores ({stats.detractors}%)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Estatísticas dos Detratores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Detratores</p>
                    <p className="text-2xl font-bold text-red-600">{detractors.length}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nota Média</p>
                    <p className="text-2xl font-bold text-red-600">{averageScore}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">% do Total</p>
                    <p className="text-2xl font-bold text-red-600">{stats.detractors}%</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Detratores - Prioritário */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-600">Colaboradores que Precisam de Atenção Urgente</h3>
              <Badge variant="destructive">Prioridade Alta</Badge>
            </div>
            
            {detractors.map((detractor) => (
              <Card key={detractor.id} className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800">{detractor.employeeName}</h4>
                        <p className="text-sm text-gray-700 mt-1 font-medium">{detractor.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(detractor.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className="bg-red-100 text-red-800">
                        Nota {detractor.score}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContactDetractor(detractor.employeeName)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Contatar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {detractors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Nenhum detrator encontrado no período atual</p>
                <p className="text-sm mt-1">Isso é uma excelente notícia!</p>
              </div>
            )}
          </div>

          {/* Plano de Ação */}
          <Card className="border-red-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 text-red-800">Plano de Ação Urgente</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <p className="text-sm">Contactar individualmente cada detrator em até 48h</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <p className="text-sm">Investigar causas raiz dos problemas mencionados</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <p className="text-sm">Criar plano de melhoria específico para cada caso</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <p className="text-sm">Acompanhar evolução mensalmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
