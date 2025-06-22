
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, Calendar, FileText, Mail, CheckCircle, Clock, AlertCircle, 
  TrendingUp, TrendingDown, Filter, Download, Eye, Users
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

interface EnhancedStatsModalProps {
  children: React.ReactNode;
  type: 'sent' | 'scheduled' | 'drafts' | 'openRate';
}

export const EnhancedStatsModal: React.FC<EnhancedStatsModalProps> = ({ children, type }) => {
  const [open, setOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [channelFilter, setChannelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { notifications, stats } = useNotifications();

  // Mock trend data - in real app, this would come from API
  const trendData = [
    { date: '2024-03-14', sent: 12, opened: 8, delivered: 11 },
    { date: '2024-03-15', sent: 15, opened: 12, delivered: 14 },
    { date: '2024-03-16', sent: 18, opened: 14, delivered: 17 },
    { date: '2024-03-17', sent: 22, opened: 18, delivered: 21 },
    { date: '2024-03-18', sent: 19, opened: 15, delivered: 18 },
    { date: '2024-03-19', sent: 25, opened: 22, delivered: 24 },
    { date: '2024-03-20', sent: 28, opened: 24, delivered: 27 }
  ];

  const channelData = [
    { name: 'WhatsApp', value: 45, color: '#25D366' },
    { name: 'Email', value: 35, color: '#EA4335' },
    { name: 'Ambos', value: 20, color: '#4285F4' }
  ];

  const typeDistribution = [
    { type: 'Comunicado', count: 45 },
    { type: 'Lembrete', count: 32 },
    { type: 'Aviso', count: 28 },
    { type: 'Aniversário', count: 15 },
    { type: 'Personalizada', count: 12 }
  ];

  const getModalTitle = () => {
    switch (type) {
      case 'sent': return 'Análise de Mensagens Enviadas';
      case 'scheduled': return 'Análise de Mensagens Programadas';
      case 'drafts': return 'Análise de Rascunhos';
      case 'openRate': return 'Análise de Taxa de Abertura';
    }
  };

  const getMainMetric = () => {
    switch (type) {
      case 'sent': return { value: stats.sentToday, label: 'Enviadas Hoje', trend: '+12%', positive: true };
      case 'scheduled': return { value: stats.scheduled, label: 'Programadas', trend: '+5%', positive: true };
      case 'drafts': return { value: stats.drafts, label: 'Rascunhos', trend: '-8%', positive: false };
      case 'openRate': return { value: `${stats.openRate}%`, label: 'Taxa de Abertura', trend: '+3%', positive: true };
    }
  };

  const mainMetric = getMainMetric();

  const chartConfig = {
    sent: { label: 'Enviadas', color: '#3b82f6' },
    opened: { label: 'Abertas', color: '#10b981' },
    delivered: { label: 'Entregues', color: '#8b5cf6' }
  };

  const handleExport = () => {
    const data = {
      type: getModalTitle(),
      metric: mainMetric,
      filters: { timeFilter, channelFilter, typeFilter },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-stats-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {getModalTitle()}
            </DialogTitle>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos canais</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="ambos">Ambos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos tipos</SelectItem>
              <SelectItem value="comunicado">Comunicado</SelectItem>
              <SelectItem value="lembrete">Lembrete</SelectItem>
              <SelectItem value="aviso">Aviso</SelectItem>
              <SelectItem value="aniversario">Aniversário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="channels">Canais</TabsTrigger>
            <TabsTrigger value="types">Tipos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Main Metric Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{mainMetric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-4xl font-bold">{mainMetric.value}</p>
                      <div className={`flex items-center gap-1 text-sm ${mainMetric.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {mainMetric.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{mainMetric.trend}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">vs. período anterior</p>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Send className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Entrega</p>
                      <p className="text-2xl font-bold text-green-600">{stats.deliveryRate}%</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Enviadas</p>
                      <p className="text-2xl font-bold">{stats.totalSent}</p>
                    </div>
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Destinatários Únicos</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Envios (Últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#3b82f6" name="Enviadas" />
                    <Line type="monotone" dataKey="delivered" stroke="#8b5cf6" name="Entregues" />
                    <Line type="monotone" dataKey="opened" stroke="#10b981" name="Abertas" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Canal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {channelData.map((channel) => (
                    <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: channel.color }}
                        />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{channel.value}%</p>
                        <p className="text-sm text-gray-500">do total</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo de Notificação</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px]">
                  <BarChart data={typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
