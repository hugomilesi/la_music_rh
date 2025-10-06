import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }[];
}

export interface EmailTemplate {
  templateId: string;
  variables: Record<string, any>;
}

export class EmailService {
  private static instance: EmailService;
  private defaultFrom = 'LA Music RH <onboarding@resend.dev>';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send a simple email
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {

      const { data, error } = await resend.emails.send({
        from: emailData.from || this.defaultFrom,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo,
        attachments: emailData.attachments,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail({
    to,
    subject,
    message,
    recipientName,
    type = 'comunicado'
  }: {
    to: string | string[];
    subject: string;
    message: string;
    recipientName?: string;
    type?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateNotificationTemplate({
      recipientName: recipientName || 'Colaborador',
      subject,
      message,
      type
    });

    return this.sendEmail({
      to,
      subject,
      html,
      text: message
    });
  }

  /**
   * Send birthday notification
   */
  async sendBirthdayEmail({
    to,
    employeeName,
    birthdayDate
  }: {
    to: string | string[];
    employeeName: string;
    birthdayDate: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `🎉 Aniversário de ${employeeName}`;
    const html = this.generateBirthdayTemplate({ employeeName, birthdayDate });

    return this.sendEmail({
      to,
      subject,
      html,
      text: `Hoje é aniversário de ${employeeName}! Não esqueça de parabenizar.`
    });
  }

  /**
   * Send vacation alert email
   */
  async sendVacationAlertEmail({
    to,
    employeeName,
    startDate,
    endDate,
    daysRemaining
  }: {
    to: string | string[];
    employeeName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `🏖️ Alerta de Férias - ${employeeName}`;
    const html = this.generateVacationTemplate({ employeeName, startDate, endDate, daysRemaining });

    return this.sendEmail({
      to,
      subject,
      html,
      text: `${employeeName} entrará em férias em ${daysRemaining} dias (${startDate} a ${endDate}).`
    });
  }

  /**
   * Send document email
   */
  async sendDocumentEmail({
    to,
    subject,
    message,
    documents
  }: {
    to: string;
    subject: string;
    message: string;
    documents: { name: string; url: string }[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.generateDocumentTemplate({ message, documents });

    return this.sendEmail({
      to,
      subject,
      html,
      text: message
    });
  }

  /**
   * Generate notification email template
   */
  private generateNotificationTemplate({
    recipientName,
    subject,
    message,
    type
  }: {
    recipientName: string;
    subject: string;
    message: string;
    type: string;
  }): string {
    const typeColors = {
      'comunicado': '#3B82F6',
      'aviso': '#F59E0B',
      'lembrete': '#10B981',
      'aniversario': '#EC4899',
      'personalizada': '#8B5CF6'
    };

    const color = typeColors[type as keyof typeof typeColors] || '#6B7280';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">LA Music RH</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${type}</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">${subject}</h2>
              <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 14px;">Olá, ${recipientName}</p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">Este é um email automático do sistema LA Music RH</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} LA Music RH. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate birthday email template
   */
  private generateBirthdayTemplate({
    employeeName,
    birthdayDate
  }: {
    employeeName: string;
    birthdayDate: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Aniversário de ${employeeName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🎉 Aniversário!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">LA Music RH</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px; text-align: center;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">🎂 ${employeeName}</h2>
              
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <p style="color: #92400E; margin: 0; font-size: 18px; font-weight: bold;">Hoje é um dia especial!</p>
                <p style="color: #B45309; margin: 10px 0 0 0; font-size: 16px;">Data: ${new Date(birthdayDate).toLocaleDateString('pt-BR')}</p>
              </div>
              
              <p style="color: #6b7280; margin: 20px 0; font-size: 16px; line-height: 1.6;">
                Não esqueça de parabenizar nosso colaborador! 🎈<br>
                Momentos como este fortalecem nossa equipe.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">Este é um email automático do sistema LA Music RH</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} LA Music RH. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate vacation alert email template
   */
  private generateVacationTemplate({
    employeeName,
    startDate,
    endDate,
    daysRemaining
  }: {
    employeeName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alerta de Férias - ${employeeName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">🏖️ Alerta de Férias</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">LA Music RH</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 22px;">${employeeName}</h2>
              
              <div style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-radius: 12px; padding: 25px; margin: 20px 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                  <span style="color: #1E40AF; font-weight: bold; font-size: 16px;">Período de Férias:</span>
                </div>
                <p style="color: #1E3A8A; margin: 0; font-size: 16px;">
                  <strong>Início:</strong> ${new Date(startDate).toLocaleDateString('pt-BR')}<br>
                  <strong>Fim:</strong> ${new Date(endDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div style="background-color: ${daysRemaining <= 7 ? '#FEF2F2' : '#F0FDF4'}; border: 2px solid ${daysRemaining <= 7 ? '#FECACA' : '#BBF7D0'}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <p style="color: ${daysRemaining <= 7 ? '#DC2626' : '#16A34A'}; margin: 0; font-size: 18px; font-weight: bold;">
                  ${daysRemaining <= 7 ? '⚠️' : '📅'} Faltam ${daysRemaining} dias
                </p>
              </div>
              
              <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; line-height: 1.6;">
                Lembre-se de organizar as atividades e responsabilidades antes do período de férias.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">Este é um email automático do sistema LA Music RH</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} LA Music RH. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate document email template
   */
  private generateDocumentTemplate({
    message,
    documents
  }: {
    message: string;
    documents: { name: string; url: string }[];
  }): string {
    const documentsList = documents.map(doc => 
      `<li style="margin: 10px 0;"><a href="${doc.url}" style="color: #3B82F6; text-decoration: none;">${doc.name}</a></li>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Documentos - LA Music RH</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">📄 Documentos</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 5px 0 0 0; font-size: 14px;">LA Music RH</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #7C3AED; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="color: #374151; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              ${documents.length > 0 ? `
                <h3 style="color: #1f2937; margin: 20px 0 10px 0; font-size: 18px;">Documentos Anexos:</h3>
                <ul style="color: #374151; padding-left: 20px;">
                  ${documentsList}
                </ul>
              ` : ''}
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">Este é um email automático do sistema LA Music RH</p>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} LA Music RH. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance();
export default emailService;