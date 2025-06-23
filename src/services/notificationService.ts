
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
    
    return data?.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as Notification['type'],
      recipients: notification.recipients,
      recipientNames: notification.recipient_names,
      channel: notification.channel as Notification['channel'],
      status: notification.status as Notification['status'],
      scheduledFor: notification.scheduled_for,
      sentAt: notification.sent_at,
      createdAt: notification.created_at,
      createdBy: notification.created_by,
      templateId: notification.template_id,
      metadata: notification.metadata as Notification['metadata']
    })) || [];
  },

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        recipients: notificationData.recipients,
        recipient_names: notificationData.recipientNames,
        channel: notificationData.channel,
        status: notificationData.status,
        scheduled_for: notificationData.scheduledFor,
        sent_at: notificationData.sentAt,
        created_by: notificationData.createdBy,
        template_id: notificationData.templateId,
        metadata: notificationData.metadata
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type as Notification['type'],
      recipients: data.recipients,
      recipientNames: data.recipient_names,
      channel: data.channel as Notification['channel'],
      status: data.status as Notification['status'],
      scheduledFor: data.scheduled_for,
      sentAt: data.sent_at,
      createdAt: data.created_at,
      createdBy: data.created_by,
      templateId: data.template_id,
      metadata: data.metadata as Notification['metadata']
    };
  },

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        title: updates.title,
        message: updates.message,
        type: updates.type,
        recipients: updates.recipients,
        recipient_names: updates.recipientNames,
        channel: updates.channel,
        status: updates.status,
        scheduled_for: updates.scheduledFor,
        sent_at: updates.sentAt,
        template_id: updates.templateId,
        metadata: updates.metadata
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type as Notification['type'],
      recipients: data.recipients,
      recipientNames: data.recipient_names,
      channel: data.channel as Notification['channel'],
      status: data.status as Notification['status'],
      scheduledFor: data.scheduled_for,
      sentAt: data.sent_at,
      createdAt: data.created_at,
      createdBy: data.created_by,
      templateId: data.template_id,
      metadata: data.metadata as Notification['metadata']
    };
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};
