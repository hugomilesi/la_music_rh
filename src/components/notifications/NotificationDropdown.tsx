
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, AlertTriangle, Calendar, FileText, Clock, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDetailsModal } from './NotificationDetailsModal';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'urgent' | 'success';
  time: string;
  read: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Documentos Vencidos',
    message: '7 colaboradores com documentos vencidos',
    type: 'warning',
    time: '2h atrás',
    read: false
  },
  {
    id: '2',
    title: 'Avaliações em Andamento',
    message: '15 avaliações em processo de revisão',
    type: 'info',
    time: '4h atrás',
    read: false
  },
  {
    id: '3',
    title: 'Aniversário Hoje',
    message: 'Ana Silva está fazendo aniversário',
    type: 'success',
    time: '6h atrás',
    read: true
  },
  {
    id: '4',
    title: 'Reunião Urgente',
    message: 'Reunião pedagógica marcada para hoje às 14h',
    type: 'urgent',
    time: '1 dia atrás',
    read: false
  }
];

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Convert to full notification format for the details modal
    const fullNotification = {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: 'lembrete' as const,
      recipients: ['1'],
      recipientNames: ['Sistema'],
      channel: 'email' as const,
      status: 'enviado' as const,
      createdAt: new Date(Date.now() - parseInt(notification.time.split('h')[0]) * 60 * 60 * 1000).toISOString(),
      createdBy: 'Sistema',
      sentAt: new Date(Date.now() - parseInt(notification.time.split('h')[0]) * 60 * 60 * 1000).toISOString(),
    };

    setSelectedNotification(fullNotification);
    setDetailsModalOpen(true);
    markAsRead(notification.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs flex items-center justify-center p-0"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-white" align="end">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Notificações</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma notificação</p>
              </div>
            )}

            <Separator className="my-3" />
            
            <Button variant="ghost" className="w-full text-sm">
              Ver todas as notificações
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetailsModal
        notification={selectedNotification}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
      />
    </>
  );
};
