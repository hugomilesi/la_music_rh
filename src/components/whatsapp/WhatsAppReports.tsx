
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon, Calendar as CalendarIcon, Download, TrendingUp, MessageSquare, Users, Clock, CheckCircle } from 'lucide-react';
import { useWhatsApp } from '@/contexts/WhatsAppContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const mockReportData = {
  dailyMessages: [
    { date: '15/03', sent: 45, delivered: 42, read: 38, failed: 3 },
    { date: '16/03', sent: 52, delivered: 48, read: 41, failed: 4 },
    { date: '17/03', sent: 38, delivered: 35, read: 32, failed: 3 },
    { date: '18/03', sent: 67, delivered: 63, read: 55, failed: 4 },
    { date: '19/03', sent: 41, delivered: 39, read: 35, failed: 2 },
    { date: '20/03', sent: 58, delivered: 54, read: 48, failed: 4 },
    { date: '21/03', sent: 72, delivered: 68, read: 61, failed: 4 }
  ],
  messageTypes: [
    { name: 'Texto', value: 65, color: '#3B82F6' },
    { name: 'Template', value: 30, color: '#10B981' },
    { name: 'Mídia', value: 5, color: '#F59E0B' }
  ],
  deliveryRates: [
    { period: 'Última Semana', delivered: 94, read: 78 },
    { period: 'Último Mês', delivered: 92, read: 75 },
    { period: 'Últimos 3 Meses', delivered: 91, read: 73 }
  ],
  topRecipients: [
    { name: 'Ana Silva', messages: 15, lastMessage: '2024-03-21T14:30:00' },
    { name: 'Carlos Santos', messages: 12, lastMessage: '2024-03-21T13:45:00' },
    { name: 'Maria Oliveira', messages: 10, lastMessage: '2024-03-21T12:15:00' },
    { name: 'João Costa', messages: 8, lastMessage: '2024-03-21T11:30:00' },
    { name: 'Lucia Ferreira', messages: 7, lastMessage: '2024-03-21T10:45:00' }
  ]
};

export const WhatsAppReports: React.FC = () => {
  const { stats } = useWhatsApp();
  const [dateRange, setDateRange] = useState('7days');
  const [reportType, setReportType] = useState('overview');
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const exportReport = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'daily':
        data = mockReportData.dailyMessages;
        filename = 'relatorio-diario-whatsapp';
        break;
      case 'recipients':
        data = mockReportData.topRecipients;
        filename = 'relatorio-destinatarios-whatsapp';
        break;
      case 'delivery':
        data = mockReportData.deliveryRates;
        filename = 'relatorio-entrega-whatsapp';
        break;
      default:
        data = [
          { metric: 'Total de Mensagens', value: stats.messagesTotal },
          { metric: 'Mensagens Hoje', value: stats.messagesToday },
          { metric: 'Taxa de Entrega (%)', value: stats.deliveryRate },
          { metric: 'Taxa de Leitura (%)', value: stats.readRate },
          { metric: 'Mensagens Falhadas', value: stats.failedCount },
          { metric: 'Tempo Médio de Resposta (min)', value: stats.avgResponseTime }
        ];
        filename = 'relatorio-geral-whatsapp';
    }

    const csvString = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="w-5 h-5" />
            Relatórios e Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="daily">Análise Diária</SelectItem>
                <SelectItem value="delivery">Taxa de Entrega</SelectItem>
                <SelectItem value="recipients">Top Destinatários</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Últimos 7 dias</SelectItem>
                <SelectItem value="30days">Últimos 30 dias</SelectItem>
                <SelectItem value="90days">Últimos 90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateFrom, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => date && setDateFrom(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <span>até</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(dateTo, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => date && setDateTo(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Button onClick={() => exportReport(reportType)} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Mensagens</p>
                    <p className="text-2xl font-bold">{stats.messagesTotal}</p>
                    <p className="text-xs text-green-600">+12% vs período anterior</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Entrega</p>
                    <p className="text-2xl font-bold">{Math.round(stats.deliveryRate)}%</p>
                    <p className="text-xs text-green-600">+2% vs período anterior</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Leitura</p>
                    <p className="text-2xl font-bold">{Math.round(stats.readRate)}%</p>
                    <p className="text-xs text-green-600">+5% vs período anterior</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tempo Médio</p>
                    <p className="text-2xl font-bold">{stats.avgResponseTime}min</p>
                    <p className="text-xs text-red-600">+0.5min vs período anterior</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockReportData.messageTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {mockReportData.messageTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Destinatários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReportData.topRecipients.map((recipient, index) => (
                    <div key={recipient.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-gray-500">
                            Última mensagem: {format(new Date(recipient.lastMessage), 'dd/MM HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {recipient.messages} mensagens
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Daily Analysis */}
      {reportType === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle>Análise Diária de Mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockReportData.dailyMessages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#3B82F6" name="Enviadas" />
                <Bar dataKey="delivered" fill="#10B981" name="Entregues" />
                <Bar dataKey="read" fill="#8B5CF6" name="Lidas" />
                <Bar dataKey="failed" fill="#EF4444" name="Falhadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Delivery Rates */}
      {reportType === 'delivery' && (
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Entrega por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockReportData.deliveryRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="delivered" stroke="#10B981" name="Taxa de Entrega %" />
                <Line type="monotone" dataKey="read" stroke="#8B5CF6" name="Taxa de Leitura %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Recipients Detail */}
      {reportType === 'recipients' && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Destinatários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReportData.topRecipients.map((recipient, index) => (
                <div key={recipient.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{recipient.name}</h3>
                        <p className="text-sm text-gray-500">
                          {recipient.messages} mensagens enviadas
                        </p>
                        <p className="text-sm text-gray-500">
                          Última interação: {format(new Date(recipient.lastMessage), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800">
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
