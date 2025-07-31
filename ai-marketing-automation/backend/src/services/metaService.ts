import axios from 'axios';
import { logger, logWebhookActivity } from '@/utils/logger';
import { aiAgentService } from './aiAgent';

export interface MetaMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  platform: 'facebook' | 'instagram';
  messageType: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
}

export interface MetaUser {
  id: string;
  name?: string;
  username?: string;
  profilePicture?: string;
  platform: 'facebook' | 'instagram';
}

class MetaService {
  private accessToken: string;
  private verifyToken: string;
  private pageId: string;
  private instagramBusinessId: string;
  private apiVersion: string = 'v18.0';

  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN || '';
    this.verifyToken = process.env.META_VERIFY_TOKEN || '';
    this.pageId = process.env.META_PAGE_ID || '';
    this.instagramBusinessId = process.env.INSTAGRAM_BUSINESS_ID || '';
  }

  private getApiUrl(endpoint: string): string {
    return `https://graph.facebook.com/${this.apiVersion}/${endpoint}`;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`
    };
  }

  // Verificação do webhook
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      logger.info('Webhook Meta verificado com sucesso');
      return challenge;
    }
    logger.warn('Falha na verificação do webhook Meta');
    return null;
  }

  // Enviar mensagem via Facebook Messenger
  async sendFacebookMessage(recipientId: string, message: string): Promise<boolean> {
    try {
      const url = this.getApiUrl(`${this.pageId}/messages`);
      const payload = {
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: 'RESPONSE'
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('facebook', 'message_sent', { recipientId, message: message.substring(0, 100) });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar mensagem Facebook:', error);
      return false;
    }
  }

  // Enviar mensagem via Instagram Direct
  async sendInstagramMessage(recipientId: string, message: string): Promise<boolean> {
    try {
      const url = this.getApiUrl(`${this.instagramBusinessId}/messages`);
      const payload = {
        recipient: { id: recipientId },
        message: { text: message }
      };

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      logWebhookActivity('instagram', 'message_sent', { recipientId, message: message.substring(0, 100) });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Erro ao enviar mensagem Instagram:', error);
      return false;
    }
  }

  // Obter informações do usuário Facebook
  async getFacebookUserInfo(userId: string): Promise<MetaUser | null> {
    try {
      const url = this.getApiUrl(`${userId}`);
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          fields: 'name,profile_pic'
        }
      });

      if (response.data) {
        return {
          id: userId,
          name: response.data.name,
          profilePicture: response.data.profile_pic,
          platform: 'facebook'
        };
      }

      return null;
    } catch (error) {
      logger.error('Erro ao obter informações do usuário Facebook:', error);
      return null;
    }
  }

  // Obter informações do usuário Instagram
  async getInstagramUserInfo(userId: string): Promise<MetaUser | null> {
    try {
      const url = this.getApiUrl(`${userId}`);
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          fields: 'name,username,profile_picture_url'
        }
      });

      if (response.data) {
        return {
          id: userId,
          name: response.data.name,
          username: response.data.username,
          profilePicture: response.data.profile_picture_url,
          platform: 'instagram'
        };
      }

      return null;
    } catch (error) {
      logger.error('Erro ao obter informações do usuário Instagram:', error);
      return null;
    }
  }

  // Processar webhook do Facebook
  async processFacebookWebhook(webhookData: any): Promise<void> {
    try {
      logWebhookActivity('facebook', 'webhook_received', webhookData);

      if (webhookData.object === 'page') {
        for (const entry of webhookData.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              await this.processFacebookMessage(messagingEvent);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Erro ao processar webhook Facebook:', error);
    }
  }

  // Processar webhook do Instagram
  async processInstagramWebhook(webhookData: any): Promise<void> {
    try {
      logWebhookActivity('instagram', 'webhook_received', webhookData);

      if (webhookData.object === 'instagram') {
        for (const entry of webhookData.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              await this.processInstagramMessage(messagingEvent);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Erro ao processar webhook Instagram:', error);
    }
  }

  // Processar mensagem individual do Facebook
  private async processFacebookMessage(messagingEvent: any): Promise<void> {
    try {
      // Ignorar mensagens próprias
      if (messagingEvent.message?.is_echo) {
        return;
      }

      const senderId = messagingEvent.sender.id;
      const messageText = messagingEvent.message?.text || '';

      if (!messageText) {
        return; // Ignorar mensagens sem texto
      }

      // Obter informações do usuário
      const userInfo = await this.getFacebookUserInfo(senderId);

      // Contexto para o agente de IA
      const context = {
        platform: 'facebook',
        user: userInfo,
        timestamp: messagingEvent.timestamp
      };

      // Selecionar o melhor agente
      const selectedAgent = await aiAgentService.selectBestAgent(messageText, context);

      // Processar mensagem com IA
      const aiResponse = await aiAgentService.processMessage(
        selectedAgent,
        messageText,
        context
      );

      // Enviar resposta
      if (aiResponse.message) {
        await this.sendFacebookMessage(senderId, aiResponse.message);
      }

    } catch (error) {
      logger.error('Erro ao processar mensagem Facebook:', error);
    }
  }

  // Processar mensagem individual do Instagram
  private async processInstagramMessage(messagingEvent: any): Promise<void> {
    try {
      const senderId = messagingEvent.sender.id;
      const messageText = messagingEvent.message?.text || '';

      if (!messageText) {
        return; // Ignorar mensagens sem texto
      }

      // Obter informações do usuário
      const userInfo = await this.getInstagramUserInfo(senderId);

      // Contexto para o agente de IA
      const context = {
        platform: 'instagram',
        user: userInfo,
        timestamp: messagingEvent.timestamp
      };

      // Selecionar o melhor agente
      const selectedAgent = await aiAgentService.selectBestAgent(messageText, context);

      // Processar mensagem com IA
      const aiResponse = await aiAgentService.processMessage(
        selectedAgent,
        messageText,
        context
      );

      // Enviar resposta
      if (aiResponse.message) {
        await this.sendInstagramMessage(senderId, aiResponse.message);
      }

    } catch (error) {
      logger.error('Erro ao processar mensagem Instagram:', error);
    }
  }

  // Publicar post no Facebook
  async publishFacebookPost(message: string, imageUrl?: string): Promise<string | null> {
    try {
      const url = this.getApiUrl(`${this.pageId}/feed`);
      const payload: any = {
        message: message
      };

      if (imageUrl) {
        payload.link = imageUrl;
      }

      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      if (response.data.id) {
        logWebhookActivity('facebook', 'post_published', { message: message.substring(0, 100), imageUrl });
        return response.data.id;
      }

      return null;
    } catch (error) {
      logger.error('Erro ao publicar post Facebook:', error);
      return null;
    }
  }

  // Publicar post no Instagram
  async publishInstagramPost(imageUrl: string, caption?: string): Promise<string | null> {
    try {
      // Primeiro, criar o container de mídia
      const createUrl = this.getApiUrl(`${this.instagramBusinessId}/media`);
      const createPayload = {
        image_url: imageUrl,
        caption: caption || ''
      };

      const createResponse = await axios.post(createUrl, createPayload, {
        headers: this.getHeaders()
      });

      if (!createResponse.data.id) {
        return null;
      }

      const mediaId = createResponse.data.id;

      // Aguardar processamento da mídia
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Publicar o post
      const publishUrl = this.getApiUrl(`${this.instagramBusinessId}/media_publish`);
      const publishPayload = {
        creation_id: mediaId
      };

      const publishResponse = await axios.post(publishUrl, publishPayload, {
        headers: this.getHeaders()
      });

      if (publishResponse.data.id) {
        logWebhookActivity('instagram', 'post_published', { imageUrl, caption: caption?.substring(0, 100) });
        return publishResponse.data.id;
      }

      return null;
    } catch (error) {
      logger.error('Erro ao publicar post Instagram:', error);
      return null;
    }
  }

  // Obter métricas da página Facebook
  async getFacebookPageMetrics(): Promise<any> {
    try {
      const url = this.getApiUrl(`${this.pageId}/insights`);
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          metric: 'page_fans,page_impressions,page_engaged_users',
          period: 'day',
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Erro ao obter métricas Facebook:', error);
      return null;
    }
  }

  // Obter métricas do Instagram Business
  async getInstagramMetrics(): Promise<any> {
    try {
      const url = this.getApiUrl(`${this.instagramBusinessId}/insights`);
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: {
          metric: 'follower_count,impressions,reach,profile_views',
          period: 'day',
          since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Erro ao obter métricas Instagram:', error);
      return null;
    }
  }
}

export const metaService = new MetaService();
