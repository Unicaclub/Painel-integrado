import axios from 'axios';
import { logger, logWebhookActivity } from '@/utils/logger';
import { aiAgentService } from './aiAgent';

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  timestamp: number;
  mediaUrl?: string;
  caption?: string;
}

export interface WhatsAppContact {
  phone: string;
  name?: string;
  profilePicture?: string;
}

class WhatsAppService {
  private baseUrl: string;
  private instanceId: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io/instances';
    this.instanceId = process.env.ZAPI_INSTANCE_ID || '';
    this.token = process.env.ZAPI_TOKEN || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Client-Token': this.token
    };
  }

  private getApiUrl(endpoint: string): string {
    return `${this.baseUrl}/${this.instanceId}/${endpoint}`;
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const url = this.getApiUrl('send-text');
      const payload = {
        phone: to,
        message: message
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('whatsapp', 'message_sent', { to, message: message.substring(0, 100) });
      
      return response.data.success || response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
    try {
      const url = this.getApiUrl('send-image');
      const payload = {
        phone: to,
        image: imageUrl,
        caption: caption || ''
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('whatsapp', 'image_sent', { to, imageUrl, caption });
      
      return response.data.success || response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar imagem WhatsApp:', error);
      return false;
    }
  }

  async sendDocument(to: string, documentUrl: string, filename: string): Promise<boolean> {
    try {
      const url = this.getApiUrl('send-document');
      const payload = {
        phone: to,
        document: documentUrl,
        filename: filename
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('whatsapp', 'document_sent', { to, documentUrl, filename });
      
      return response.data.success || response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar documento WhatsApp:', error);
      return false;
    }
  }

  async getContactInfo(phone: string): Promise<WhatsAppContact | null> {
    try {
      const url = this.getApiUrl('get-contact');
      const response = await axios.get(`${url}/${phone}`, {
        headers: this.getHeaders()
      });

      if (response.data && response.data.contact) {
        return {
          phone: phone,
          name: response.data.contact.name || response.data.contact.pushname,
          profilePicture: response.data.contact.profilePicture
        };
      }

      return null;
    } catch (error) {
      logger.error('Erro ao obter informações do contato:', error);
      return null;
    }
  }

  async processIncomingMessage(webhookData: any): Promise<void> {
    try {
      logWebhookActivity('whatsapp', 'message_received', webhookData);

      // Extrair dados da mensagem
      const message: WhatsAppMessage = {
        id: webhookData.messageId || webhookData.id,
        from: webhookData.phone || webhookData.from,
        to: webhookData.instanceId || this.instanceId,
        body: webhookData.text?.message || webhookData.body || '',
        type: webhookData.type || 'text',
        timestamp: webhookData.timestamp || Date.now(),
        mediaUrl: webhookData.image?.imageUrl || webhookData.mediaUrl,
        caption: webhookData.image?.caption || webhookData.caption
      };

      // Ignorar mensagens próprias
      if (webhookData.fromMe) {
        return;
      }

      // Obter informações do contato
      const contact = await this.getContactInfo(message.from);
      
      // Contexto para o agente de IA
      const context = {
        platform: 'whatsapp',
        contact: contact,
        messageType: message.type,
        timestamp: message.timestamp
      };

      // Selecionar o melhor agente para responder
      const selectedAgent = await aiAgentService.selectBestAgent(message.body, context);
      
      // Processar mensagem com IA
      const aiResponse = await aiAgentService.processMessage(
        selectedAgent,
        message.body,
        context
      );

      // Enviar resposta
      if (aiResponse.message) {
        await this.sendMessage(message.from, aiResponse.message);
        
        // Se houver ações sugeridas, enviar como mensagem adicional
        if (aiResponse.suggestedActions && aiResponse.suggestedActions.length > 0) {
          const actionsMessage = `\n💡 *Sugestões:*\n${aiResponse.suggestedActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}`;
          
          setTimeout(() => {
            this.sendMessage(message.from, actionsMessage);
          }, 2000); // Delay de 2 segundos
        }
      }

    } catch (error) {
      logger.error('Erro ao processar mensagem WhatsApp:', error);
    }
  }

  async sendBulkMessage(contacts: string[], message: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        const sent = await this.sendMessage(contact, message);
        if (sent) {
          success++;
        } else {
          failed++;
        }
        
        // Delay entre mensagens para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failed++;
        logger.error(`Erro ao enviar mensagem para ${contact}:`, error);
      }
    }

    logWebhookActivity('whatsapp', 'bulk_message_sent', { 
      totalContacts: contacts.length, 
      success, 
      failed 
    });

    return { success, failed };
  }

  async getInstanceStatus(): Promise<any> {
    try {
      const url = this.getApiUrl('status');
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      return {
        connected: response.data.connected || false,
        phone: response.data.phone || null,
        status: response.data.status || 'unknown'
      };
    } catch (error) {
      logger.error('Erro ao obter status da instância:', error);
      return {
        connected: false,
        phone: null,
        status: 'error'
      };
    }
  }

  async createGroup(name: string, participants: string[]): Promise<string | null> {
    try {
      const url = this.getApiUrl('create-group');
      const payload = {
        groupName: name,
        phones: participants
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      if (response.data.success) {
        logWebhookActivity('whatsapp', 'group_created', { name, participants });
        return response.data.groupId;
      }

      return null;
    } catch (error) {
      logger.error('Erro ao criar grupo WhatsApp:', error);
      return null;
    }
  }

  async sendMessageToGroup(groupId: string, message: string): Promise<boolean> {
    try {
      const url = this.getApiUrl('send-text');
      const payload = {
        phone: groupId,
        message: message
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('whatsapp', 'group_message_sent', { groupId, message: message.substring(0, 100) });
      
      return response.data.success || response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar mensagem para grupo:', error);
      return false;
    }
  }

  // Webhook validation
  validateWebhook(body: any, signature?: string): boolean {
    // Implementar validação de webhook se necessário
    // Por enquanto, aceitar todas as mensagens
    return true;
  }
}

export const whatsappService = new WhatsAppService();
