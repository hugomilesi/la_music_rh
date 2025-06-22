
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, Send, CheckCircle, Clock, 
  AlertCircle, TrendingUp, Users, Activity 
} from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';

interface RealtimeMetric {
  label: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
  color: string;
}

interface WhatsAppDashboardProps {
  className?: string;
}

export const WhatsAppDashboard: React.FC<WhatsAppDashboardProps> = ({ className }) => {
  const { stats, messages, config } = useWhatsApp();
  const [realtimeData, setRealtimeData] = useState<RealtimeMetric[]>([]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealtimeData([
        {
          label: 'Mensagens Hoje',
          value: stats.messagesToday,
          trend: Math.random() > 0.5 ? 1 : -1,
          icon: <MessageSquare className="w-5 h-5" />,
          color: 'blue'
        },
        {
          label: 'Taxa de Entrega',
          value: Math.round(stats.deliveryRate),
          trend: Math.random() > 0.3 ? 1 : -1,
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'green'
        },
        {
          label: 'Taxa de Leitura',
          value: Math.round(stats.readRate),
          trend: Math.random() > 0.4 ? 1 : -1,
          icon: <Activity className="w-5 h-5" />,
          color: 'purple'
        },
        {
          label: 'Falhas',
          value: stats.failedCount,
          trend: Math.random() > 0.7 ? 1 : -1,
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'red'
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, [stats]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'sent': 'text-blue-600',
      'delivered': 'text-green-600',
      'read': 'text-purple-600',
      'failed': 'text-red-600',
      'pending': 'text-yellow-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="w-3 h-3" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3" />;
      case 'read':
        return <Activity className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className={className}>
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status da API</p>
                <p className="text-lg font-bold">
                  {config.isConfigured ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                config.isConfigured ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <CheckCircle className={`w-5 h-5 ${
                  config.isConfigured ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Mensagens</p>
                <p className="text-2xl font-bold">{stats.messagesTotal}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}min</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-green-600">{stats.messagesToday}</p>
                <p className="text-xs text-green-600">+15% vs ontem</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Métricas em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {realtimeData.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                      <div className={`text-${metric.color}-600`}>
                        {metric.icon}
                      </div>
                    </div>
                    <span className="font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <div className={`flex items-center text-sm ${
                      metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${
                        metric.trend < 0 ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Entrega</span>
                  <span>{Math.round(stats.deliveryRate)}%</span>
                </div>
                <Progress value={stats.deliveryRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Leitura</span>
                  <span>{Math.round(stats.readRate)}%</span>
                </div>
                <Progress value={stats.readRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Taxa de Sucesso Geral</span>
                  <span>{Math.round((stats.deliveryRate + stats.readRate) / 2)}%</span>
                </div>
                <Progress value={(stats.deliveryRate + stats.readRate) / 2} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Mensagens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.recipientName}</span>
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={getStatusColor(message.status)}>
                    {getStatusIcon(message.status)}
                  </div>
                  <Badge className={
                    message.status === 'read' ? 'bg-purple-100 text-purple-800' :
                    message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    message.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    message.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {message.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
