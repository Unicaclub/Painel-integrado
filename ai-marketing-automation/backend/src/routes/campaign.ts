import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

// Obter todas as campanhas
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Dados mock para desenvolvimento
    const campaigns = [
      {
        id: '1',
        name: 'Campanha de Verão 2025',
        platform: 'Instagram',
        status: 'active',
        budget: 5000,
        spent: 3200,
        impressions: 45000,
        clicks: 1200,
        conversions: 85,
        ctr: 2.67,
        conversionRate: 7.08,
        createdAt: '2025-07-25T10:00:00Z',
        updatedAt: '2025-07-30T15:30:00Z'
      },
      {
        id: '2',
        name: 'Geração de Leads WhatsApp',
        platform: 'WhatsApp',
        status: 'active',
        budget: 2000,
        spent: 800,
        impressions: 12000,
        clicks: 450,
        conversions: 32,
        ctr: 3.75,
        conversionRate: 7.11,
        createdAt: '2025-07-28T09:00:00Z',
        updatedAt: '2025-07-30T14:20:00Z'
      },
      {
        id: '3',
        name: 'Awareness Facebook',
        platform: 'Facebook',
        status: 'paused',
        budget: 3000,
        spent: 2100,
        impressions: 28000,
        clicks: 890,
        conversions: 45,
        ctr: 3.18,
        conversionRate: 5.06,
        createdAt: '2025-07-20T14:00:00Z',
        updatedAt: '2025-07-29T11:45:00Z'
      }
    ];

    return res.json({
      success: true,
      data: {
        campaigns,
        total: campaigns.length,
        active: campaigns.filter(c => c.status === 'active').length,
        paused: campaigns.filter(c => c.status === 'paused').length
      }
    });
  } catch (error) {
    logger.error('Erro ao obter campanhas:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Obter campanha específica
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Mock data
    const campaign = {
      id,
      name: 'Campanha de Verão 2025',
      platform: 'Instagram',
      status: 'active',
      budget: 5000,
      spent: 3200,
      impressions: 45000,
      clicks: 1200,
      conversions: 85,
      ctr: 2.67,
      conversionRate: 7.08,
      targetAudience: {
        ageRange: '25-45',
        gender: 'all',
        location: 'Brasil',
        interests: ['marketing', 'tecnologia', 'empreendedorismo']
      },
      creatives: [
        {
          id: '1',
          type: 'image',
          url: 'https://example.com/creative1.jpg',
          performance: {
            impressions: 25000,
            clicks: 700,
            ctr: 2.8
          }
        }
      ],
      schedule: {
        startDate: '2025-07-25',
        endDate: '2025-08-25',
        timezone: 'America/Sao_Paulo'
      },
      createdAt: '2025-07-25T10:00:00Z',
      updatedAt: '2025-07-30T15:30:00Z'
    };

    return res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error('Erro ao obter campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Criar nova campanha
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, platform, budget, targetAudience, schedule } = req.body;

    if (!name || !platform || !budget) {
      return res.status(400).json({
        success: false,
        error: 'Nome, plataforma e orçamento são obrigatórios'
      });
    }

    // Mock creation
    const newCampaign = {
      id: Date.now().toString(),
      name,
      platform,
      status: 'draft',
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      conversionRate: 0,
      targetAudience: targetAudience || {},
      schedule: schedule || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      data: newCampaign,
      message: 'Campanha criada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao criar campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Atualizar campanha
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock update
    const updatedCampaign = {
      id,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: updatedCampaign,
      message: 'Campanha atualizada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao atualizar campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Pausar/Reativar campanha
router.patch('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido. Use: active, paused, completed'
      });
    }

    return res.json({
      success: true,
      data: {
        id,
        status,
        updatedAt: new Date().toISOString()
      },
      message: `Campanha ${status === 'active' ? 'ativada' : status === 'paused' ? 'pausada' : 'finalizada'} com sucesso`
    });
  } catch (error) {
    logger.error('Erro ao alterar status da campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Deletar campanha
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    return res.json({
      success: true,
      message: 'Campanha deletada com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Obter métricas da campanha
router.get('/:id/metrics', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;

    // Mock metrics data
    const metrics = {
      campaignId: id,
      period,
      data: [
        { date: '2025-07-24', impressions: 5200, clicks: 156, conversions: 12, spent: 320 },
        { date: '2025-07-25', impressions: 6800, clicks: 204, conversions: 18, spent: 425 },
        { date: '2025-07-26', impressions: 7100, clicks: 213, conversions: 15, spent: 445 },
        { date: '2025-07-27', impressions: 6500, clicks: 195, conversions: 14, spent: 410 },
        { date: '2025-07-28', impressions: 7800, clicks: 234, conversions: 16, spent: 490 },
        { date: '2025-07-29', impressions: 6200, clicks: 186, conversions: 10, spent: 390 },
        { date: '2025-07-30', impressions: 5400, clicks: 162, conversions: 8, spent: 340 }
      ],
      summary: {
        totalImpressions: 45000,
        totalClicks: 1350,
        totalConversions: 93,
        totalSpent: 2820,
        averageCtr: 3.0,
        averageConversionRate: 6.89,
        costPerClick: 2.09,
        costPerConversion: 30.32
      }
    };

    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Erro ao obter métricas da campanha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

export default router;