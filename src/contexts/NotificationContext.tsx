
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification, NotificationStats, NotificationTemplate, NotificationRecipient } from '@/types/notification';

interface NotificationContextType {
  notifications: Notification[];
  stats: NotificationStats;
  templates: NotificationTemplate[];
  recipients: NotificationRecipient[];
  loading: boolean;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  updateNotification: (id: string, updates: Partial<Notification>) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  sendNotification: (id: string) => Promise<void>;
  scheduleNotification: (id: string, scheduledFor: string) => Promise<void>;
  getTemplate: (id: string) => NotificationTemplate | undefined;
  refreshStats: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Mock data
const mockTemplates: NotificationTemplate[] = [
  {
    id: 'birthday-template',
    name: 'Aniversário',
    subject: 'Parabéns pelo seu aniversário!',
    message: 'Parabéns, {name}! Desejamos muito sucesso e felicidade! 🎉',
    type: 'aniversario',
    variables: ['name']
  },
  {
    id: 'meeting-reminder',
    name: 'Lembrete de Reunião',
    subject: 'Lembrete: Reunião {type}',
    message: 'Lembrete: {name}, você tem uma reunião {type} agendada para {date} às {time}.',
    type: 'lembrete',
    variables: ['name', 'type', 'date', 'time']
  },
  {
    id: 'general-announcement',
    name: 'Comunicado Geral',
    subject: 'Comunicado Importante',
    message: 'Prezados colaboradores, {message}',
    type: 'comunicado',
    variables: ['message']
  }
];

const mockRecipients: NotificationRecipient[] = [
  { id: '1', name: 'Ana Silva', phone: '+5511999999999', email: 'ana@email.com', unit: 'Campo Grande', role: 'Professora' },
  { id: '2', name: 'Carlos Santos', phone: '+5511888888888', email: 'carlos@email.com', unit: 'Vila Olímpia', role: 'Coordenador' },
  { id: '3', name: 'Maria Oliveira', phone: '+5511777777777', email: 'maria@email.com', unit: 'Tatuapé', role: 'Recepcionista' },
  { id: '4', name: 'João Costa', phone: '+5511666666666', email: 'joao@email.com', unit: 'Moema', role: 'Professor' },
  { id: '5', name: 'Lucia Ferreira', phone: '+5511555555555', email: 'lucia@email.com', unit: 'Campo Grande', role: 'Consultora de Vendas' }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Reunião Pedagógica Mensal',
    message: 'Lembrete: Reunião pedagógica agendada para amanhã às 14h',
    type: 'lembrete',
    recipients: ['1', '2'],
    recipientNames: ['Ana Silva', 'Carlos Santos'],
    channel: 'email',
    status: 'enviado',
    sentAt: '2024-03-20T10:00:00Z',
    createdAt: '2024-03-20T09:00:00Z',
    createdBy: 'Admin',
    metadata: { readCount: 1, deliveredCount: 2, failedCount: 0 }
  },
  {
    id: '2',
    title: 'Aniversário - Ana Silva',
    message: 'Parabéns, Ana! Desejamos muito sucesso! 🎉',
    type: 'aniversario',
    recipients: ['1'],
    recipientNames: ['Ana Silva'],
    channel: 'whatsapp',
    status: 'programado',
    scheduledFor: '2024-03-21T09:00:00Z',
    createdAt: '2024-03-20T08:00:00Z',
    createdBy: 'Admin',
    templateId: 'birthday-template'
  }
];

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loading, setLoading] = useState(false);

  const stats: NotificationStats = {
    sentToday: 15,
    scheduled: 8,
    drafts: 3,
    openRate: 87,
    deliveryRate: 98,
    totalSent: 156
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    setLoading(true);
    try {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

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

  const getTemplate = (id: string) => {
    return mockTemplates.find(template => template.id === id);
  };

  const refreshStats = async () => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      stats,
      templates: mockTemplates,
      recipients: mockRecipients,
      loading,
      createNotification,
      updateNotification,
      deleteNotification,
      sendNotification,
      scheduleNotification,
      getTemplate,
      refreshStats
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
