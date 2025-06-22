
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, Clock, 
  CheckCircle, AlertTriangle, Users, MessageSquare 
} from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  target?: number;
  trend: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
}

export const PerformanceAnalytics: React.FC = () => {
  const metrics: PerformanceMetric[] = [
    {
      label: 'Taxa de Entrega',
      value: 98,
      target: 95,
      trend: 2,
      unit: '%',
      status: 'good'
    },
    {
      label: 'Taxa de Abertura',
      value: 87,
      target: 80,
      trend: 3,
      unit: '%',
      status: 'good'
    },
    {
      label: 'Taxa de Clique',
      value: 23,
      target: 25,
      trend: -2,
      unit: '%',
      status: 'warning'
    },
    {
      label: 'Tempo Médio de Abertura',
      value: 15,
      target: 30,
      trend: -5,
      unit: 'min',
      status: 'good'
    },
    {
      label: 'Engajamento Geral',
      value: 78,
      target: 75,
      trend: 5,
      unit: '%',
      status: 'good'
    },
    {
      label: 'Taxa de Descadastro',
      value: 2,
      target: 3,
      trend: -0.5,
      unit: '%',
      status: 'good'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Performance Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                  {getStatusIcon(metric.status)}
                </div>
                
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                  {metric.target && (
                    <span className="text-sm text-gray-500">
                      / meta: {metric.target}{metric.unit}
                    </span>
                  )}
                </div>

                {metric.target && (
                  <Progress 
                    value={(metric.value / metric.target) * 100} 
                    className="h-2"
                  />
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center gap-1 ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.trend >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{metric.trend >= 0 ? '+' : ''}{metric.trend}{metric.unit}</span>
                  </div>
                  <span className="text-gray-500">vs. período anterior</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Insights de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Melhor Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Comunicados</p>
                    <p className="text-sm text-green-600">Taxa de abertura: 92%</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">Horário: 9h-11h</p>
                    <p className="text-sm text-blue-600">Maior engajamento</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Ideal</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Oportunidades de Melhoria</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-800">Lembretes</p>
                    <p className="text-sm text-yellow-600">Taxa de abertura: 65%</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Melhorar</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-800">Fins de semana</p>
                    <p className="text-sm text-orange-600">Baixo engajamento</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Evitar</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Segmentação de Audiência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Professores</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">89%</p>
              <p className="text-sm text-gray-500">Taxa de abertura</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Coordenadores</h4>
              <p className="text-2xl font-bold text-green-600 mt-2">94%</p>
              <p className="text-sm text-gray-500">Taxa de abertura</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900">Administrativo</h4>
              <p className="text-2xl font-bold text-purple-600 mt-2">76%</p>
              <p className="text-sm text-gray-500">Taxa de abertura</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
