
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Calendar, FileText, Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

interface StatsModalProps {
  children: React.ReactNode;
  type: 'sent' | 'scheduled' | 'drafts' | 'openRate';
}

export const StatsModal: React.FC<StatsModalProps> = ({ children, type }) => {
  const [open, setOpen] = useState(false);
  const { notifications, stats, sendNotification } = useNotifications();

  const getModalContent = () => {
    switch (type) {
      case 'sent': {
        const sentToday = notifications.filter(n => {
          const today = new Date().toDateString();
          return n.status === 'enviado' && new Date(n.sentAt || '').toDateString() === today;
        });

        return {
          title: 'Mensagens Enviadas Hoje',
          icon: <Send className="w-5 h-5" />,
          count: stats.sentToday,
          notifications: sentToday
        };
      }

      case 'scheduled': {
        const scheduled = notifications.filter(n => n.status === 'programado');
        
        return {
          title: 'Mensagens Programadas',
          icon: <Calendar className="w-5 h-5" />,
          count: stats.scheduled,
          notifications: scheduled
        };
      }

      case 'drafts': {
        const drafts = notifications.filter(n => n.status === 'rascunho');
        
        return {
          title: 'Rascunhos',
          icon: <FileText className="w-5 h-5" />,
          count: stats.drafts,
          notifications: drafts
        };
      }

      case 'openRate': {
        const delivered = notifications.filter(n => n.status === 'entregue' || n.status === 'lido');
        
        return {
          title: 'Taxa de Abertura',
          icon: <Mail className="w-5 h-5" />,
          count: `${stats.openRate}%`,
          notifications: delivered
        };
      }
    }
  };

  const content = getModalContent();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <Send className="w-4 h-4 text-green-600" />;
      case 'programado':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'rascunho':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'lido':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'falhado':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'enviado': 'bg-green-100 text-green-800',
      'programado': 'bg-blue-100 text-blue-800',
      'rascunho': 'bg-gray-100 text-gray-800',
      'entregue': 'bg-green-100 text-green-800',
      'lido': 'bg-blue-100 text-blue-800',
      'falhado': 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleSendDraft = async (notificationId: string) => {
    try {
      await sendNotification(notificationId);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{content.title}</p>
                  <p className="text-3xl font-bold">{content.count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  {content.icon}
                </div>
              </div>
              
              {type === 'openRate' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Entregues</p>
                      <p className="text-lg font-semibold">{stats.deliveryRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Abertas</p>
                      <p className="text-lg font-semibold">{stats.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Enviadas</p>
                      <p className="text-lg font-semibold">{stats.totalSent}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            <h3 className="font-medium">Detalhes</h3>
            
            {content.notifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">Nenhuma notificação encontrada</p>
                </CardContent>
              </Card>
            ) : (
              content.notifications.map((notification: Notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          <Badge className={getStatusBadge(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message.length > 100 
                            ? `${notification.message.substring(0, 100)}...`
                            : notification.message
                          }
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Para: {notification.recipientNames.join(', ')}</span>
                          <span>•</span>
                          <span>{notification.channel}</span>
                          {notification.sentAt && (
                            <>
                              <span>•</span>
                              <span>{new Date(notification.sentAt).toLocaleString('pt-BR')}</span>
                            </>
                          )}
                          {notification.scheduledFor && (
                            <>
                              <span>•</span>
                              <span>Programado para: {new Date(notification.scheduledFor).toLocaleString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                        
                        {notification.metadata && (
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                            {notification.metadata.deliveredCount !== undefined && (
                              <span>Entregues: {notification.metadata.deliveredCount}</span>
                            )}
                            {notification.metadata.readCount !== undefined && (
                              <span>Lidas: {notification.metadata.readCount}</span>
                            )}
                            {notification.metadata.failedCount !== undefined && notification.metadata.failedCount > 0 && (
                              <span className="text-red-600">Falhas: {notification.metadata.failedCount}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notification.status)}
                        {notification.status === 'rascunho' && (
                          <Button
                            size="sm"
                            onClick={() => handleSendDraft(notification.id)}
                          >
                            Enviar Agora
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
