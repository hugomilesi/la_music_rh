
export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  type: NotificationType;
  variables: string[]; // Variables that can be replaced like {name}, {date}
}

export interface NotificationRecipient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  unit: string;
  role: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipients: string[]; // IDs dos destinatários
  recipientNames: string[]; // Nomes para exibição
  channel: NotificationChannel;
  status: NotificationStatus;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  templateId?: string;
  metadata?: {
    mediaUrl?: string;
    readCount?: number;
    deliveredCount?: number;
    failedCount?: number;
  };
}

export type NotificationType = 'lembrete' | 'aniversario' | 'aviso' | 'comunicado' | 'personalizada';
export type NotificationChannel = 'email' | 'whatsapp' | 'ambos';
export type NotificationStatus = 'rascunho' | 'programado' | 'enviado' | 'entregue' | 'lido' | 'falhado';

export interface NotificationStats {
  sentToday: number;
  scheduled: number;
  drafts: number;
  openRate: number;
  deliveryRate: number;
  totalSent: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: NotificationType;
  templateId?: string;
}
