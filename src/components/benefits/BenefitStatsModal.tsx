
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award,
  PieChart,
  BarChart3
} from 'lucide-react';
import { useBenefits } from '@/contexts/BenefitsContext';

interface BenefitStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BenefitStatsModal: React.FC<BenefitStatsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { stats, usage, benefits } = useBenefits();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Estatísticas de Benefícios
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Benefícios</p>
                    <p className="text-2xl font-bold">{stats.totalBenefits}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Benefícios Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeBenefits}</p>
                    <p className="text-xs text-gray-500">
                      {stats.totalBenefits > 0 ? Math.round((stats.activeBenefits / stats.totalBenefits) * 100) : 0}% do total
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Inscrições Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalEnrollments}</p>
                    <p className="text-xs text-gray-500">Funcionários inscritos</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Custo Total Mensal</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCost)}</p>
                    <p className="text-xs text-gray-500">Por mês</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Taxa de Utilização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Taxa de Utilização Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Taxa de Adoção de Benefícios</span>
                  <span className="font-semibold">{stats.utilizationRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.utilizationRate} className="h-3" />
                <div className="text-sm text-gray-600">
                  {stats.totalEnrollments} de {stats.totalBenefits > 0 ? stats.totalBenefits * 20 : 0} inscrições possíveis
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhamento por Benefício */}
          <Card>
            <CardHeader>
              <CardTitle>Utilização por Benefício</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usage.map((item) => (
                  <div key={item.benefitId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{item.benefitName}</h4>
                        <p className="text-sm text-gray-600">
                          {item.enrollments} inscrições • {formatCurrency(item.totalCost)} total
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{item.utilizationRate.toFixed(1)}%</span>
                        <p className="text-sm text-gray-600">{formatCurrency(item.avgCostPerEmployee)}/pessoa</p>
                      </div>
                    </div>
                    <Progress value={item.utilizationRate} className="h-2" />
                  </div>
                ))}
                
                {usage.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <PieChart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum dado de utilização disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Benefício Mais Popular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Award className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
                  <h3 className="text-xl font-bold">{stats.mostPopularBenefit}</h3>
                  <p className="text-gray-600">Maior número de adesões</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aprovações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">Inscrições aguardando aprovação</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
