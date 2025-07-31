import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { whatsappService } from '@/services/whatsappService';
import { metaService } from '@/services/metaService';
import { logger, logWebhookActivity } from '@/utils/logger';

const router = Router();

// Webhook do WhatsApp (Z-API)
router.post('/whatsapp', asyncHandler(async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    if (!whatsappService.validateWebhook(webhookData)) {
      return res.status(400).json({
        success: false,
        error: 'Webhook inválido'
      });
    }
    // Processar mensagem de forma assíncrona
    whatsappService.processIncomingMessage(webhookData).catch(error => {
      logger.error('Erro ao processar mensagem WhatsApp:', error);
    });

    // Retorne aqui explicitamente!
    return res.status(200).json({
      success: true,
      message: 'Webhook recebido'
    });

  } catch (error) {
    logger.error('Erro no webhook WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Webhook do Meta (Facebook/Instagram)
router.get('/meta', (req: Request, res: Response) => {
  try {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const verificationResult = metaService.verifyWebhook(mode, token, challenge);

    if (verificationResult) {
      return res.status(200).send(verificationResult);
    } else {
      return res.status(403).json({
        success: false,
        error: 'Verificação do webhook falhou'
      });
    }
  } catch (error) {
    logger.error('Erro na verificação do webhook Meta:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

router.post('/meta', asyncHandler(async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    logWebhookActivity('meta', 'webhook_received', webhookData);

    if (webhookData.object === 'page') {
      metaService.processFacebookWebhook(webhookData).catch(error => {
        logger.error('Erro ao processar webhook Facebook:', error);
      });
    } else if (webhookData.object === 'instagram') {
      metaService.processInstagramWebhook(webhookData).catch(error => {
        logger.error('Erro ao processar webhook Instagram:', error);
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processado'
    });

  } catch (error) {
    logger.error('Erro no webhook Meta:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Webhook para Email (SendGrid)
router.post('/email', asyncHandler(async (req: Request, res: Response) => {
  try {
    const webhookData = req.body;
    logWebhookActivity('email', 'webhook_received', webhookData);

    if (Array.isArray(webhookData)) {
      for (const event of webhookData) {
        await processEmailEvent(event);
      }
    } else {
      await processEmailEvent(webhookData);
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook de email processado'
    });

  } catch (error) {
    logger.error('Erro no webhook de email:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

async function processEmailEvent(event: any): Promise<void> {
  try {
    const { event: eventType, email, timestamp, reason } = event;
    switch (eventType) {
      case 'delivered':
        logger.info(`Email entregue para: ${email}`);
        break;
      case 'open':
        logger.info(`Email aberto por: ${email}`);
        break;
      case 'click':
        logger.info(`Link clicado por: ${email}`);
        break;
      case 'bounce':
        logger.warn(`Email rejeitado para: ${email}, motivo: ${reason}`);
        break;
      case 'dropped':
        logger.warn(`Email descartado para: ${email}, motivo: ${reason}`);
        break;
      case 'spam_report':
        logger.warn(`Email marcado como spam por: ${email}`);
        break;
      case 'unsubscribe':
        logger.info(`Usuário cancelou inscrição: ${email}`);
        break;
      default:
        logger.info(`Evento de email não tratado: ${eventType} para ${email}`);
    }
    // Lógica adicional...
  } catch (error) {
    logger.error('Erro ao processar evento de email:', error);
  }
}

// Rota para testar webhooks
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { platform, message, recipient } = req.body;

    if (!platform || !message) {
      return res.status(400).json({
        success: false,
        error: 'Platform e message são obrigatórios'
      });
    }

    let result = false;
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        if (!recipient) {
          return res.status(400).json({
            success: false,
            error: 'Recipient é obrigatório para WhatsApp'
          });
        }
        result = await whatsappService.sendMessage(recipient, message);
        break;

      case 'facebook':
        if (!recipient) {
          return res.status(400).json({
            success: false,
            error: 'Recipient é obrigatório para Facebook'
          });
        }
        result = await metaService.sendFacebookMessage(recipient, message);
        break;

      case 'instagram':
        if (!recipient) {
          return res.status(400).json({
            success: false,
            error: 'Recipient é obrigatório para Instagram'
          });
        }
        result = await metaService.sendInstagramMessage(recipient, message);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Platform não suportada. Use: whatsapp, facebook, instagram'
        });
    }

    return res.json({
      success: result,
      message: result ? 'Mensagem enviada com sucesso' : 'Falha ao enviar mensagem',
      platform,
      recipient,
      messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : '')
    });

  } catch (error) {
    logger.error('Erro no teste de webhook:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Rota para obter status dos serviços
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const whatsappStatus = await whatsappService.getInstanceStatus();

    const status = {
      whatsapp: whatsappStatus,
      facebook: {
        connected: true,
        status: process.env.META_ACCESS_TOKEN ? 'active' : 'not_configured'
      },
      instagram: {
        connected: true,
        status: process.env.INSTAGRAM_BUSINESS_ID ? 'active' : 'not_configured'
      },
      email: {
        connected: true,
        status: process.env.SENDGRID_API_KEY ? 'active' : 'not_configured'
      }
    };

    return res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Erro ao obter status dos serviços:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

export default router;