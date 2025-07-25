
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { emailService } from './emailService';

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

  /**
   * Send notification via email
   */
  async sendNotificationEmail(notification: Notification): Promise<{ success: boolean; error?: string }> {
    try {
      // Get recipient emails from employees table
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('email, name')
        .in('id', notification.recipients);

      if (employeesError) {
        console.error('Error fetching employee emails:', employeesError);
        return { success: false, error: 'Erro ao buscar emails dos destinatários' };
      }

      if (!employees || employees.length === 0) {
        return { success: false, error: 'Nenhum destinatário encontrado' };
      }

      const emailAddresses = employees.map(emp => emp.email).filter(Boolean);
      
      if (emailAddresses.length === 0) {
        return { success: false, error: 'Nenhum email válido encontrado' };
      }

      // Send email based on notification type
      let emailResult;
      
      if (notification.type === 'aniversario') {
        // For birthday notifications, we need to get the birthday info
        const employeeName = employees[0]?.name || 'Colaborador';
        emailResult = await emailService.sendBirthdayEmail({
          to: emailAddresses,
          employeeName,
          birthdayDate: new Date().toISOString() // You might want to get this from metadata
        });
      } else {
        // Regular notification
        emailResult = await emailService.sendNotificationEmail({
          to: emailAddresses,
          subject: notification.title,
          message: notification.message,
          type: notification.type
        });
      }

      if (emailResult.success) {
        // Update notification status
        await this.updateNotification(notification.id, {
          status: 'enviado',
          sentAt: new Date().toISOString(),
          metadata: {
            ...notification.metadata,
            emailMessageId: emailResult.messageId,
            deliveredCount: emailAddresses.length
          }
        });
        
        return { success: true };
      } else {
        return { success: false, error: emailResult.error };
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  },

  /**
   * Send vacation alert emails
   */
  async sendVacationAlerts(): Promise<{ success: boolean; sent: number; errors: string[] }> {
    try {
      // Get upcoming vacation requests (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: vacationRequests, error } = await supabase
        .from('vacation_requests')
        .select(`
          *,
          employee:employees!vacation_requests_employee_id_fkey(name, email)
        `)
        .eq('status', 'aprovado')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .lte('start_date', nextWeek.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching vacation requests:', error);
        return { success: false, sent: 0, errors: [error.message] };
      }

      if (!vacationRequests || vacationRequests.length === 0) {
        return { success: true, sent: 0, errors: [] };
      }

      // Get HR emails to notify
      const { data: hrEmployees, error: hrError } = await supabase
        .from('employees')
        .select('email')
        .eq('department', 'RH')
        .eq('status', 'ativo');

      if (hrError || !hrEmployees || hrEmployees.length === 0) {
        return { success: false, sent: 0, errors: ['Nenhum email de RH encontrado'] };
      }

      const hrEmails = hrEmployees.map(emp => emp.email).filter(Boolean);
      let sent = 0;
      const errors: string[] = [];

      // Send alert for each vacation request
      for (const vacation of vacationRequests) {
        const startDate = new Date(vacation.start_date);
        const today = new Date();
        const daysRemaining = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const emailResult = await emailService.sendVacationAlertEmail({
          to: hrEmails,
          employeeName: vacation.employee?.name || 'Colaborador',
          startDate: vacation.start_date,
          endDate: vacation.end_date,
          daysRemaining
        });

        if (emailResult.success) {
          sent++;
        } else {
          errors.push(`Erro ao enviar alerta para ${vacation.employee?.name}: ${emailResult.error}`);
        }
      }

      return { success: errors.length === 0, sent, errors };
    } catch (error) {
      console.error('Error sending vacation alerts:', error);
      return { success: false, sent: 0, errors: [error instanceof Error ? error.message : 'Erro desconhecido'] };
    }
  },

  /**
   * Send birthday notifications
   */
  async sendBirthdayNotifications(): Promise<{ success: boolean; sent: number; errors: string[] }> {
    try {
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      // Get employees with birthday today
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, name, email, birth_date')
        .eq('status', 'ativo')
        .not('birth_date', 'is', null);

      if (error) {
        console.error('Error fetching employees:', error);
        return { success: false, sent: 0, errors: [error.message] };
      }

      if (!employees || employees.length === 0) {
        return { success: true, sent: 0, errors: [] };
      }

      // Filter employees with birthday today
      const birthdayEmployees = employees.filter(emp => {
        if (!emp.birth_date) return false;
        const birthDate = new Date(emp.birth_date);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
      });

      if (birthdayEmployees.length === 0) {
        return { success: true, sent: 0, errors: [] };
      }

      // Get all employee emails to notify about birthdays
      const { data: allEmployees, error: allError } = await supabase
        .from('employees')
        .select('email')
        .eq('status', 'ativo')
        .not('email', 'is', null);

      if (allError || !allEmployees || allEmployees.length === 0) {
        return { success: false, sent: 0, errors: ['Nenhum email de colaborador encontrado'] };
      }

      const allEmails = allEmployees.map(emp => emp.email).filter(Boolean);
      let sent = 0;
      const errors: string[] = [];

      // Send birthday notification for each birthday employee
      for (const employee of birthdayEmployees) {
        const emailResult = await emailService.sendBirthdayEmail({
          to: allEmails,
          employeeName: employee.name,
          birthdayDate: employee.birth_date
        });

        if (emailResult.success) {
          sent++;
          
          // Create notification record
          await this.createNotification({
            title: `🎉 Aniversário de ${employee.name}`,
            message: `Hoje é aniversário de ${employee.name}! Não esqueça de parabenizar.`,
            type: 'aniversario',
            recipients: [employee.id],
            recipientNames: [employee.name],
            channel: 'email',
            status: 'enviado',
            sentAt: new Date().toISOString(),
            createdBy: 'system',
            metadata: {
              emailMessageId: emailResult.messageId,
              deliveredCount: allEmails.length
            }
          });
        } else {
          errors.push(`Erro ao enviar aniversário de ${employee.name}: ${emailResult.error}`);
        }
      }

      return { success: errors.length === 0, sent, errors };
    } catch (error) {
      console.error('Error sending birthday notifications:', error);
      return { success: false, sent: 0, errors: [error instanceof Error ? error.message : 'Erro desconhecido'] };
    }
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
