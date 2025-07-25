import { useState } from 'react';
import { emailService } from '@/services/emailService';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';

export interface EmailHookResult {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  /**
   * Send a general email
   */
  const sendEmail = async (params: {
    to: string[];
    subject: string;
    message: string;
    attachments?: Array<{ filename: string; content: string; type: string }>;
  }): Promise<EmailHookResult> => {
    setIsLoading(true);
    resetState();

    try {
      const result = await emailService.sendEmail(params);
      
      if (result.success) {
        setSuccess(true);
        return { isLoading: false, error: null, success: true };
      } else {
        setError(result.error || 'Erro ao enviar email');
        return { isLoading: false, error: result.error || 'Erro ao enviar email', success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { isLoading: false, error: errorMessage, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send notification email
   */
  const sendNotificationEmail = async (notification: Notification): Promise<EmailHookResult> => {
    setIsLoading(true);
    resetState();

    try {
      const result = await notificationService.sendNotificationEmail(notification);
      
      if (result.success) {
        setSuccess(true);
        return { isLoading: false, error: null, success: true };
      } else {
        setError(result.error || 'Erro ao enviar notificação por email');
        return { isLoading: false, error: result.error || 'Erro ao enviar notificação por email', success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { isLoading: false, error: errorMessage, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send birthday notifications
   */
  const sendBirthdayNotifications = async (): Promise<EmailHookResult & { sent: number }> => {
    setIsLoading(true);
    resetState();

    try {
      const result = await notificationService.sendBirthdayNotifications();
      
      if (result.success) {
        setSuccess(true);
        return { isLoading: false, error: null, success: true, sent: result.sent };
      } else {
        const errorMessage = result.errors.join(', ');
        setError(errorMessage);
        return { isLoading: false, error: errorMessage, success: false, sent: result.sent };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { isLoading: false, error: errorMessage, success: false, sent: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send vacation alerts
   */
  const sendVacationAlerts = async (): Promise<EmailHookResult & { sent: number }> => {
    setIsLoading(true);
    resetState();

    try {
      const result = await notificationService.sendVacationAlerts();
      
      if (result.success) {
        setSuccess(true);
        return { isLoading: false, error: null, success: true, sent: result.sent };
      } else {
        const errorMessage = result.errors.join(', ');
        setError(errorMessage);
        return { isLoading: false, error: errorMessage, success: false, sent: result.sent };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { isLoading: false, error: errorMessage, success: false, sent: 0 };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send document email
   */
  const sendDocumentEmail = async (params: {
    to: string[];
    employeeName: string;
    documentType: string;
    documentUrl?: string;
    message?: string;
  }): Promise<EmailHookResult> => {
    setIsLoading(true);
    resetState();

    try {
      const result = await emailService.sendDocumentEmail(params);
      
      if (result.success) {
        setSuccess(true);
        return { isLoading: false, error: null, success: true };
      } else {
        setError(result.error || 'Erro ao enviar documento por email');
        return { isLoading: false, error: result.error || 'Erro ao enviar documento por email', success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return { isLoading: false, error: errorMessage, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    error,
    success,
    
    // Actions
    sendEmail,
    sendNotificationEmail,
    sendBirthdayNotifications,
    sendVacationAlerts,
    sendDocumentEmail,
    resetState
  };
};