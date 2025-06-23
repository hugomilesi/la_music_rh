
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Notification, 
  NotificationTemplate, 
  NotificationRecipient, 
  NotificationStats, 
  QuickAction,
  NotificationType,
  NotificationChannel,
  NotificationStatus
} from '@/types/notification';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  templates: NotificationTemplate[];
  recipients: NotificationRecipient[];
  isLoading: boolean;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getNotificationStats: () => NotificationStats;
  getQuickActions: () => QuickAction[];
  sendNotification: (id: string) => Promise<void>;
  scheduleNotification: (id: string, scheduledFor: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock data para templates e destinatários (seriam carregados do banco posteriormente)
const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Lembrete de Aniversário',
    subject: 'Parabéns pelo seu aniversário!',
    message: 'Olá {name}, feliz aniversário! Que este novo ano seja repleto de alegrias e conquistas.',
    type: 'aniversario',
    variables: ['name']
  },
  {
    id: '2',
    name: 'Lembrete de Documento',
    subject: 'Documento vencendo',
    message: 'Olá {name}, seu documento {document} vence em {days} dias. Por favor, providencie a renovação.',
    type: 'lembrete',
    variables: ['name', 'document', 'days']
  }
];

const mockRecipients: NotificationRecipient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@example.com',
    phone: '+5521999999999',
    unit: 'Campo Grande',
    role: 'Professor'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos@example.com',
    phone: '+5521888888888',
    unit: 'Recreio',
    role: 'Coordenador'
  }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates] = useState<NotificationTemplate[]>(mockTemplates);
  const [recipients] = useState<NotificationRecipient[]>(mockRecipients);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const createNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const newNotification = await notificationService.createNotification(notificationData);
      setNotifications(prev => [...prev, newNotification]);
      toast({
        title: "Sucesso",
        description: "Notificação criada com sucesso",
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar notificação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    try {
      const updatedNotification = await notificationService.updateNotification(id, updates);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? updatedNotification : notif
      ));
      toast({
        title: "Sucesso",
        description: "Notificação atualizada com sucesso",
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar notificação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      toast({
        title: "Sucesso",
        description: "Notificação removida com sucesso",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover notificação",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getNotificationStats = (): NotificationStats => {
    const today = new Date().toISOString().split('T')[0];
    const sentToday = notifications.filter(n => 
      n.sentAt && n.sentAt.startsWith(today)
    ).length;
    
    const scheduled = notifications.filter(n => n.status === 'programado').length;
    const drafts = notifications.filter(n => n.status === 'rascunho').length;
    const totalSent = notifications.filter(n => n.status === 'enviado').length;
    const delivered = notifications.filter(n => n.status === 'entregue').length;
    const read = notifications.filter(n => n.status === 'lido').length;
    
    return {
      sentToday,
      scheduled,
      drafts,
      openRate: totalSent > 0 ? (read / totalSent) * 100 : 0,
      deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
      totalSent
    };
  };

  const getQuickActions = (): QuickAction[] => [
    {
      id: '1',
      title: 'Lembrete de Aniversário',
      description: 'Enviar parabéns para aniversariantes',
      icon: 'cake',
      type: 'aniversario',
      templateId: '1'
    },
    {
      id: '2',
      title: 'Comunicado Geral',
      description: 'Enviar comunicado para todos',
      icon: 'megaphone',
      type: 'comunicado'
    },
    {
      id: '3',
      title: 'Lembrete Personalizado',
      description: 'Criar lembrete customizado',
      icon: 'bell',
      type: 'lembrete'
    }
  ];

  const sendNotification = async (id: string) => {
    await updateNotification(id, { 
      status: 'enviado',
      sentAt: new Date().toISOString()
    });
  };

  const scheduleNotification = async (id: string, scheduledFor: string) => {
    await updateNotification(id, { 
      status: 'programado',
      scheduledFor
    });
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      templates,
      recipients,
      isLoading,
      createNotification,
      updateNotification,
      deleteNotification,
      getNotificationStats,
      getQuickActions,
      sendNotification,
      scheduleNotification,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
