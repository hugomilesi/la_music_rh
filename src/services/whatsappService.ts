import { supabase } from '@/integrations/supabase/client';
import { 
  evolutionApiConfig, 
  validateEvolutionApiConfig, 
  formatApiUrl, 
  getEvolutionApiHeaders 
} from '../config/evolutionApi';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type?: 'text' | 'media';
  mediaUrl?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  instanceName?: string;
  qrCode?: string;
  error?: string;
}

export class WhatsAppService {
  private static config = evolutionApiConfig;

  // Enviar mensagem via Evolution API
  static async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      console.log(`📞 WhatsAppService.sendMessage iniciado para: ${phoneNumber}`);
      
      // Validar número de telefone
      const cleanPhone = this.cleanPhoneNumber(phoneNumber);
      if (!cleanPhone) {
        console.error('❌ Número de telefone inválido:', phoneNumber);
        return false;
      }
      console.log(`✅ Número limpo: ${cleanPhone}`);

      // Preparar dados da mensagem
      const messageData = {
        number: cleanPhone,
        text: message
      };
      console.log(`📝 Dados da mensagem:`, messageData);

      // Validar configuração antes de enviar
      if (!validateEvolutionApiConfig(this.config)) {
        console.error('❌ Configuração da Evolution API inválida');
        return false;
      }

      // Fazer requisição para Evolution API
      const fullUrl = formatApiUrl(this.config.apiUrl, `/message/sendText/${this.config.instanceName}`);
      console.log(`🌐 URL da API: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getEvolutionApiHeaders(this.config.apiKey),
        body: JSON.stringify(messageData)
      });
      
      console.log(`📡 Resposta da API - Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na Evolution API:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('✅ Mensagem enviada com sucesso:', result);

      // Registrar mensagem no banco
      await this.logMessage(cleanPhone, message, 'sent', result.key?.id);

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      
      // Registrar erro no banco
      await this.logMessage(phoneNumber, message, 'failed', undefined, error instanceof Error ? error.message : 'Erro desconhecido');
      
      return false;
    }
  }

  // Verificar status da conexão WhatsApp
  static async getConnectionStatus(): Promise<WhatsAppStatus> {
    try {
      const apiUrl = this.evolutionApiUrl.endsWith('/') ? this.evolutionApiUrl.slice(0, -1) : this.evolutionApiUrl;
      const response = await fetch(`${apiUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.evolutionApiKey || ''
        }
      });

      if (!response.ok) {
        return {
          isConnected: false,
          error: `Erro HTTP: ${response.status}`
        };
      }

      const result = await response.json();
      
      return {
        isConnected: result.instance?.state === 'open',
        instanceName: this.instanceName,
        error: result.instance?.state !== 'open' ? 'Instância não conectada' : undefined
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Obter QR Code para conexão
  static async getQRCode(): Promise<string | null> {
    try {
      const apiUrl = this.evolutionApiUrl.endsWith('/') ? this.evolutionApiUrl.slice(0, -1) : this.evolutionApiUrl;
      const response = await fetch(`${apiUrl}/instance/connect/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.evolutionApiKey || ''
        }
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.base64 || null;
    } catch (error) {
      return null;
    }
  }

  // Criar instância WhatsApp
  static async createInstance(): Promise<boolean> {
    try {
      // Validar configuração antes de criar instância
      if (!validateEvolutionApiConfig(this.config)) {
        return false;
      }

      const instanceData = {
        instanceName: this.config.instanceName,
        token: this.config.apiKey,
        qrcode: true,
        webhook: {
          url: `${window.location.origin}/api/nps/whatsapp-webhook`,
          events: ['messages.upsert', 'connection.update']
        }
      };

      const fullUrl = formatApiUrl(this.config.apiUrl, '/instance/create');
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: getEvolutionApiHeaders(this.config.apiKey),
        body: JSON.stringify(instanceData)
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Limpar e validar número de telefone
  private static cleanPhoneNumber(phone: string): string | null {
    if (!phone) return null;

    // Remover caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, '');

    // Adicionar código do país se não tiver (assumindo Brasil +55)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
      cleanPhone = '55' + cleanPhone;
    } else if (cleanPhone.length === 10) {
      cleanPhone = '5511' + cleanPhone;
    } else if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
      cleanPhone = '55' + cleanPhone;
    }

    // Validar formato final
    if (cleanPhone.length >= 12 && cleanPhone.length <= 15) {
      return cleanPhone;
    }

    return null;
  }

  // Registrar mensagem no banco de dados
  private static async logMessage(
    phoneNumber: string,
    message: string,
    status: 'sent' | 'failed' | 'delivered' | 'read',
    messageId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const logData = {
        phone_number: phoneNumber,
        message_content: message,
        status,
        whatsapp_message_id: messageId,
        error_message: errorMessage,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        delivered_at: status === 'delivered' ? new Date().toISOString() : null,
        read_at: status === 'read' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('whatsapp_sends')
        .insert([logData]);

      if (error) {
        // Error handling
      }
    } catch (error) {
      // Error handling
    }
  }

  // Processar webhook de status de mensagem
  static async processWebhook(webhookData: any): Promise<void> {
    try {
      // Processar diferentes tipos de eventos
      if (webhookData.event === 'messages.upsert') {
        await this.processMessageUpdate(webhookData.data);
      } else if (webhookData.event === 'connection.update') {
        await this.processConnectionUpdate(webhookData.data);
      }
    } catch (error) {
      // Error handling
    }
  }

  // Processar atualização de mensagem
  private static async processMessageUpdate(messageData: any): Promise<void> {
    try {
      const message = messageData.messages?.[0];
      if (!message) return;

      const messageId = message.key?.id;
      const status = message.status;
      const fromNumber = message.key?.remoteJid?.replace('@s.whatsapp.net', '');

      if (!messageId) return;

      // Atualizar status na tabela whatsapp_sends
      const updates: any = {};
      
      if (status === 'DELIVERY_ACK') {
        updates.status = 'delivered';
        updates.delivered_at = new Date().toISOString();
      } else if (status === 'READ') {
        updates.status = 'read';
        updates.read_at = new Date().toISOString();
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('whatsapp_sends')
          .update(updates)
          .eq('whatsapp_message_id', messageId);

        if (error) {
          // Error handling
        }
      }

      // Se for uma resposta do usuário, processar
      if (message.messageType === 'conversation' && fromNumber) {
        await this.processUserResponse(fromNumber, message.message?.conversation);
      }
    } catch (error) {
      // Error handling
    }
  }

  // Processar resposta do usuário
  private static async processUserResponse(phoneNumber: string, messageText: string): Promise<void> {
    try {
      // Buscar envio pendente para este número
      const { data: send, error } = await supabase
        .from('whatsapp_sends')
        .select('*')
        .eq('phone_number', phoneNumber)
        .in('status', ['sent', 'delivered', 'read'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !send) {
        return;
      }

      // Verificar se é uma resposta numérica (score NPS)
      const score = parseInt(messageText?.trim());
      if (!isNaN(score) && score >= 0 && score <= 10) {
        // Atualizar envio com a resposta
        const { error: updateError } = await supabase
          .from('whatsapp_sends')
          .update({
            status: 'responded',
            responded_at: new Date().toISOString(),
            response_score: score
          })
          .eq('id', send.id);

        if (updateError) {
          console.error('Erro ao atualizar resposta:', updateError);
          return;
        }

        // Criar resposta NPS oficial
        const { error: responseError } = await supabase
          .from('nps_responses')
          .insert({
            survey_id: send.survey_id,
            respondente_id: send.user_id,
            pontuacao: score,
            comentario: `Resposta via WhatsApp: ${messageText}`,
            response_method: 'whatsapp'
          });

        if (responseError) {
          // Error handling
        } else {
          // Enviar mensagem de agradecimento
          await this.sendThankYouMessage(phoneNumber, score);
        }
      } else {
        // Se não for um score, tratar como comentário adicional
        const { error: commentError } = await supabase
          .from('whatsapp_sends')
          .update({
            response_comment: messageText
          })
          .eq('id', send.id);

        if (commentError) {
          // Error handling
        }
      }
    } catch (error) {
      // Error handling
    }
  }

  // Enviar mensagem de agradecimento
  private static async sendThankYouMessage(phoneNumber: string, score: number): Promise<void> {
    try {
      let message = 'Obrigado pela sua resposta! 🙏\n\n';
      
      if (score >= 9) {
        message += 'Ficamos muito felizes que você esteja satisfeito! ⭐⭐⭐';
      } else if (score >= 7) {
        message += 'Agradecemos seu feedback! Continuaremos trabalhando para melhorar. 👍';
      } else {
        message += 'Sua opinião é muito importante para nós. Vamos trabalhar para melhorar! 💪';
      }

      await this.sendMessage(phoneNumber, message);
    } catch (error) {
      // Error handling
    }
  }

  // Processar atualização de conexão
  private static async processConnectionUpdate(connectionData: any): Promise<void> {
    try {
      // Aqui você pode implementar lógica para lidar com mudanças de status
      // como desconexões, reconexões, etc.
    } catch (error) {
      // Error handling
    }
  }

  // Obter estatísticas de envios
  static async getWhatsAppStats(surveyId?: string): Promise<any> {
    try {
      let query = supabase
        .from('whatsapp_sends')
        .select('status, created_at, responded_at, response_score');

      if (surveyId) {
        query = query.eq('survey_id', surveyId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calcular estatísticas
      const stats = {
        total: data.length,
        sent: data.filter(s => ['sent', 'delivered', 'read', 'responded'].includes(s.status)).length,
        delivered: data.filter(s => ['delivered', 'read', 'responded'].includes(s.status)).length,
        read: data.filter(s => ['read', 'responded'].includes(s.status)).length,
        responded: data.filter(s => s.status === 'responded').length,
        failed: data.filter(s => s.status === 'failed').length,
        pending: data.filter(s => s.status === 'pending').length,
        responseRate: 0,
        averageScore: 0
      };

      if (stats.sent > 0) {
        stats.responseRate = (stats.responded / stats.sent) * 100;
      }

      const scores = data.filter(s => s.response_score !== null).map(s => s.response_score);
      if (scores.length > 0) {
        stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      return stats;
    } catch (error) {
      return null;
    }
  }
}