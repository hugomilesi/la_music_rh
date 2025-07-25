
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
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types/notification';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'urgent' | 'info' | 'success' | 'lembrete' | 'aniversario' | 'aviso' | 'comunicado' | 'personalizada';
  time: string;
  read: boolean;
}

export const NotificationDropdown: React.FC = () => {
  const { notifications, updateNotification } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  // Convert notifications to display format and filter recent ones
  const displayNotifications = notifications
    .slice(0, 10) // Show only last 10 notifications
    .map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      time: getTimeAgo(notification.createdAt),
      type: notification.type,
      read: notification.status === 'lido'
    }));
  
  const unreadCount = notifications.filter(n => n.status !== 'lido').length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
      case 'aviso':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'info':
      case 'comunicado':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'success':
      case 'aniversario':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'lembrete':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'personalizada':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateNotification(id, { status: 'lido' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status !== 'lido');
      await Promise.all(
        unreadNotifications.map(notification => 
          updateNotification(notification.id, { status: 'lido' })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const handleNotificationClick = (displayNotification: any) => {
    const fullNotification = notifications.find(n => n.id === displayNotification.id);
    if (fullNotification) {
      setSelectedNotification(fullNotification);
      setDetailsModalOpen(true);
      markAsRead(displayNotification.id);
    }
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
              {displayNotifications.map((notification) => (
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

            {displayNotifications.length === 0 && (
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
