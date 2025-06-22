
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export const WhatsAppIntegration: React.FC = () => {
  const { notifications } = useNotifications();

  // Filter WhatsApp notifications
  const whatsappNotifications = notifications.filter(n => 
    n.channel === 'whatsapp' || n.channel === 'ambos'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
      case 'entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'lido':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'programado':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'rascunho':
        return <Clock className="w-4 h-4 text-gray-600" />;
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
      'enviado': 'bg-green-100 text-green-800',
      'programado': 'bg-blue-100 text-blue-800',
      'rascunho': 'bg-gray-100 text-gray-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      'aniversario': 'bg-pink-100 text-pink-800',
      'lembrete': 'bg-blue-100 text-blue-800',
      'aviso': 'bg-yellow-100 text-yellow-800',
      'comunicado': 'bg-purple-100 text-purple-800',
      'personalizada': 'bg-gray-100 text-gray-800'
    };
    return variants[type as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Mensagens do Sistema de Notificações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {whatsappNotifications.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma mensagem WhatsApp encontrada</p>
              <p className="text-sm text-gray-400">
                As notificações criadas no sistema aparecerão aqui
              </p>
            </div>
          ) : (
            whatsappNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{notification.title}</span>
                    <Badge className={getTypeBadge(notification.type)}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Para: {notification.recipientNames.join(', ')}</span>
                    <span>•</span>
                    <span>{new Date(notification.createdAt).toLocaleDateString('pt-BR')}</span>
                    {notification.sentAt && (
                      <>
                        <span>•</span>
                        <span>Enviado: {new Date(notification.sentAt).toLocaleTimeString('pt-BR')}</span>
                      </>
                    )}
                    {notification.scheduledFor && (
                      <>
                        <span>•</span>
                        <span>Programado: {new Date(notification.scheduledFor).toLocaleString('pt-BR')}</span>
                      </>
                    )}
                  </div>
                  
                  {notification.metadata && (
                    <div className="flex items-center gap-4 text-sm mt-2">
                      {notification.metadata.deliveredCount !== undefined && (
                        <span className="text-green-600">
                          ✓ {notification.metadata.deliveredCount} entregues
                        </span>
                      )}
                      {notification.metadata.readCount !== undefined && (
                        <span className="text-blue-600">
                          👁 {notification.metadata.readCount} lidas
                        </span>
                      )}
                      {notification.metadata.failedCount !== undefined && notification.metadata.failedCount > 0 && (
                        <span className="text-red-600">
                          ✗ {notification.metadata.failedCount} falhas
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusIcon(notification.status)}
                  <Badge className={getStatusBadge(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
