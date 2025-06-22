import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  phoneNumber: string;
  webhookUrl: string;
  isConfigured: boolean;
}

export interface WhatsAppMessage {
  id: string;
  recipient: string;
  recipientName: string;
  message: string;
  type: 'text' | 'template' | 'media';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  templateId?: string;
  metadata?: {
    mediaUrl?: string;
    templateData?: Record<string, string>;
  };
}

export interface WhatsAppAutomation {
  id: string;
  name: string;
  description: string;
  trigger: 'birthday' | 'evaluation_reminder' | 'document_expiry' | 'custom';
  template: string;
  enabled: boolean;
  schedule?: {
    time: string;
    daysBefore?: number;
  };
}

export interface WhatsAppStats {
  messagesTotal: number;
  messagesToday: number;
  deliveryRate: number;
  readRate: number;
  failedCount: number;
  avgResponseTime: number;
}

interface WhatsAppContextType {
  config: WhatsAppConfig;
  messages: WhatsAppMessage[];
  automations: WhatsAppAutomation[];
  stats: WhatsAppStats;
  loading: boolean;
  updateConfig: (config: Partial<WhatsAppConfig>) => Promise<void>;
  sendMessage: (recipient: string, message: string, type?: string) => Promise<void>;
  sendTemplateMessage: (recipient: string, templateId: string, data?: Record<string, string>) => Promise<void>;
  updateAutomation: (id: string, updates: Partial<WhatsAppAutomation>) => Promise<void>;
  getMessageHistory: (recipient?: string) => WhatsAppMessage[];
  refreshStats: () => Promise<void>;
  testConnection: () => Promise<boolean>;
}

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

// Updated mock config - now configured for demo purposes
const mockConfig: WhatsAppConfig = {
  apiUrl: 'https://api.whatsapp.business.com/v1',
  apiKey: 'demo_api_key_configured',
  phoneNumber: '+5511999999999',
  webhookUrl: 'https://example.com/webhook',
  isConfigured: true // Changed to true for demo
};

// Mock data
const mockMessages: WhatsAppMessage[] = [
  {
    id: '1',
    recipient: '+5511999999999',
    recipientName: 'Ana Silva',
    message: 'Parabéns pelo seu aniversário! Desejamos muito sucesso! 🎉',
    type: 'template',
    status: 'read',
    sentAt: '2024-03-21T09:00:00Z',
    deliveredAt: '2024-03-21T09:01:00Z',
    readAt: '2024-03-21T09:05:00Z',
    createdAt: '2024-03-21T09:00:00Z',
    templateId: 'birthday'
  },
  {
    id: '2',
    recipient: '+5511888888888',
    recipientName: 'Carlos Santos',
    message: 'Lembrete: Sua avaliação 360° está agendada para hoje às 14h.',
    type: 'template',
    status: 'delivered',
    sentAt: '2024-03-21T08:30:00Z',
    deliveredAt: '2024-03-21T08:31:00Z',
    createdAt: '2024-03-21T08:30:00Z',
    templateId: 'evaluation_reminder'
  }
];

const mockAutomations: WhatsAppAutomation[] = [
  {
    id: '1',
    name: 'Mensagens de Aniversário',
    description: 'Envio automático de parabéns no aniversário dos colaboradores',
    trigger: 'birthday',
    template: 'birthday',
    enabled: true,
    schedule: { time: '09:00' }
  },
  {
    id: '2',
    name: 'Lembretes de Avaliação',
    description: 'Notificação automática sobre avaliações agendadas',
    trigger: 'evaluation_reminder',
    template: 'evaluation_reminder',
    enabled: true,
    schedule: { time: '08:30', daysBefore: 1 }
  },
  {
    id: '3',
    name: 'Alertas de Documentos',
    description: 'Aviso sobre documentos próximos ao vencimento',
    trigger: 'document_expiry',
    template: 'document_alert',
    enabled: false,
    schedule: { time: '10:00', daysBefore: 5 }
  }
];

export const WhatsAppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WhatsAppConfig>(mockConfig);
  const [messages, setMessages] = useState<WhatsAppMessage[]>(mockMessages);
  const [automations, setAutomations] = useState<WhatsAppAutomation[]>(mockAutomations);
  const [loading, setLoading] = useState(false);

  const stats: WhatsAppStats = {
    messagesTotal: messages.length,
    messagesToday: messages.filter(m => 
      new Date(m.createdAt).toDateString() === new Date().toDateString()
    ).length,
    deliveryRate: (messages.filter(m => m.status === 'delivered' || m.status === 'read').length / messages.length) * 100,
    readRate: (messages.filter(m => m.status === 'read').length / messages.length) * 100,
    failedCount: messages.filter(m => m.status === 'failed').length,
    avgResponseTime: 2.5
  };

  const updateConfig = async (newConfig: Partial<WhatsAppConfig>) => {
    setLoading(true);
    try {
      setConfig(prev => ({ ...prev, ...newConfig }));
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipient: string, message: string, type: string = 'text') => {
    setLoading(true);
    try {
      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        recipient,
        recipientName: `Contato ${recipient.slice(-4)}`,
        message,
        type: type as any,
        status: 'sent',
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [newMessage, ...prev]);
      
      // Simulate delivery update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered', deliveredAt: new Date().toISOString() }
            : msg
        ));
      }, 2000);

      // Simulate read update
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'read', readAt: new Date().toISOString() }
            : msg
        ));
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const sendTemplateMessage = async (recipient: string, templateId: string, data?: Record<string, string>) => {
    const templates: Record<string, string> = {
      birthday: 'Parabéns pelo seu aniversário! Desejamos muito sucesso! 🎉',
      evaluation_reminder: 'Lembrete: Sua avaliação está agendada.',
      document_alert: 'Documento próximo ao vencimento.'
    };

    const message = templates[templateId] || 'Mensagem automática';
    await sendMessage(recipient, message, 'template');
  };

  const updateAutomation = async (id: string, updates: Partial<WhatsAppAutomation>) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, ...updates } : auto
    ));
  };

  const getMessageHistory = (recipient?: string) => {
    if (recipient) {
      return messages.filter(msg => msg.recipient === recipient);
    }
    return messages;
  };

  const refreshStats = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      return config.isConfigured;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WhatsAppContext.Provider value={{
      config,
      messages,
      automations,
      stats,
      loading,
      updateConfig,
      sendMessage,
      sendTemplateMessage,
      updateAutomation,
      getMessageHistory,
      refreshStats,
      testConnection
    }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};
