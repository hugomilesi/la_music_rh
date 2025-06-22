
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { WhatsAppIntegration } from '@/components/whatsapp/WhatsAppIntegration';

const mockMessages = [
  {
    id: 1,
    recipient: 'Ana Silva',
    message: 'Parabéns pelo seu aniversário! Desejamos muito sucesso! 🎉',
    type: 'aniversario',
    status: 'entregue',
    sentAt: '2024-03-21 09:00'
  },
  {
    id: 2,
    recipient: 'Carlos Santos',
    message: 'Lembrete: Sua avaliação 360° está agendada para hoje às 14h.',
    type: 'lembrete',
    status: 'lido',
    sentAt: '2024-03-21 08:30'
  },
  {
    id: 3,
    recipient: 'Maria Oliveira',
    message: 'Documento de contrato vencendo em 5 dias. Por favor, renove.',
    type: 'documento',
    status: 'enviado',
    sentAt: '2024-03-21 08:00'
  }
];

const WhatsAppPage: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'lido':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'enviado':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'falhado':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'entregue': 'bg-green-100 text-green-800',
      'lido': 'bg-blue-100 text-blue-800',
      'enviado': 'bg-yellow-100 text-yellow-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      'aniversario': 'bg-pink-100 text-pink-800',
      'lembrete': 'bg-blue-100 text-blue-800',
      'documento': 'bg-yellow-100 text-yellow-800',
      'avaliacao': 'bg-purple-100 text-purple-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
          <p className="text-gray-600 mt-1">Integração e automação de mensagens via WhatsApp</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Configurar API
          </Button>
          <Button size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Enviar Mensagem
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mensagens Hoje</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Entrega</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Leitura</p>
                <p className="text-2xl font-bold text-blue-600">85%</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Falhas</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Integration from Notifications */}
      <WhatsAppIntegration />

      {/* Send Message Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Destinatário</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                  <option>Selecione um colaborador...</option>
                  <option>Ana Silva</option>
                  <option>Carlos Santos</option>
                  <option>Maria Oliveira</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Mensagem</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-md">
                  <option>Personalizada</option>
                  <option>Aniversário</option>
                  <option>Lembrete</option>
                  <option>Documento</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Mensagem</label>
              <Textarea 
                placeholder="Digite sua mensagem..."
                className="min-h-[100px]"
              />
            </div>
            
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                title: 'Mensagens de Aniversário',
                description: 'Envio automático de parabéns no aniversário dos colaboradores',
                enabled: true
              },
              {
                title: 'Lembretes de Avaliação',
                description: 'Notificação automática sobre avaliações agendadas',
                enabled: true
              },
              {
                title: 'Alertas de Documentos',
                description: 'Aviso sobre documentos próximos ao vencimento',
                enabled: false
              },
              {
                title: 'Feedbacks de Avaliação',
                description: 'Envio automático dos resultados de avaliações',
                enabled: true
              }
            ].map((automation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium">{automation.title}</h3>
                  <p className="text-sm text-gray-600">{automation.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={automation.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {automation.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message History - Legacy Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens Manuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{msg.recipient}</span>
                    <Badge className={getTypeBadge(msg.type)}>
                      {msg.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{msg.message}</p>
                  <p className="text-xs text-gray-500">{msg.sentAt}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(msg.status)}
                  <Badge className={getStatusBadge(msg.status)}>
                    {msg.status}
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

export default WhatsAppPage;
