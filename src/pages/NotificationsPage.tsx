
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Send, Calendar, Mail, MessageSquare } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    title: 'Reunião Pedagógica Mensal',
    message: 'Lembrete: Reunião pedagógica agendada para amanhã às 14h',
    type: 'lembrete',
    recipients: 'Todos os professores',
    channel: 'email',
    status: 'enviado',
    date: '2024-03-20'
  },
  {
    id: 2,
    title: 'Aniversário - Ana Silva',
    message: 'Hoje é aniversário da Ana Silva! Parabéns! 🎉',
    type: 'aniversario',
    recipients: 'Equipe Centro',
    channel: 'whatsapp',
    status: 'programado',
    date: '2024-03-21'
  },
  {
    id: 3,
    title: 'Aviso de Férias Coletivas',
    message: 'Comunicado sobre as férias coletivas do mês de julho',
    type: 'aviso',
    recipients: 'Todos os colaboradores',
    channel: 'email',
    status: 'rascunho',
    date: '2024-03-19'
  }
];

const NotificationsPage: React.FC = () => {
  const getTypeBadge = (type: string) => {
    const variants = {
      'lembrete': 'bg-blue-100 text-blue-800',
      'aniversario': 'bg-pink-100 text-pink-800',
      'aviso': 'bg-yellow-100 text-yellow-800',
      'comunicado': 'bg-purple-100 text-purple-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'enviado': 'bg-green-100 text-green-800',
      'programado': 'bg-blue-100 text-blue-800',
      'rascunho': 'bg-gray-100 text-gray-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-1">Comunicados, avisos e lembretes para a equipe</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Programar Envio
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Notificação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviadas Hoje</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Programadas</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-600">3</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Abertura</p>
                <p className="text-2xl font-bold text-purple-600">87%</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="w-6 h-6" />
              Aniversário do Dia
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              Lembrete de Reunião
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Mail className="w-6 h-6" />
              Comunicado Geral
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Send className="w-6 h-6" />
              Aviso Importante
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{notification.title}</h3>
                    <Badge className={getTypeBadge(notification.type)}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Para: {notification.recipients}</span>
                    <div className="flex items-center gap-1">
                      {getChannelIcon(notification.channel)}
                      <span>{notification.channel}</span>
                    </div>
                    <span>{new Date(notification.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadge(notification.status)}>
                    {notification.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
