import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { aiAgentService } from '@/services/aiAgent';
import { logger } from '@/utils/logger';

const router = Router();

// Obter lista de agentes disponíveis
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const agents = aiAgentService.getAvailableAgents();
    
    res.json({
      success: true,
      data: {
        agents,
        total: agents.length
      }
    });
  } catch (error) {
    logger.error('Erro ao obter agentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Obter capacidades de um agente específico
router.get('/:agentName/capabilities', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { agentName } = req.params;
    
    const capabilities = await aiAgentService.getAgentCapabilities(agentName);
    
    res.json({
      success: true,
      data: capabilities
    });
  } catch (error) {
    logger.error(`Erro ao obter capacidades do agente ${req.params.agentName}:`, error);
    res.status(404).json({
      success: false,
      error: error.message || 'Agente não encontrado'
    });
  }
}));

// Processar mensagem com agente específico
router.post('/:agentName/message', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { agentName } = req.params;
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    const response = await aiAgentService.processMessage(
      agentName,
      message,
      context,
      conversationHistory
    );

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error(`Erro ao processar mensagem com agente ${req.params.agentName}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
}));

// Selecionar melhor agente para uma mensagem
router.post('/select', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    const selectedAgent = await aiAgentService.selectBestAgent(message, context);

    res.json({
      success: true,
      data: {
        selectedAgent,
        message: `Agente '${selectedAgent}' selecionado para processar a mensagem`
      }
    });
  } catch (error) {
    logger.error('Erro ao selecionar agente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Processar mensagem com seleção automática de agente
router.post('/chat', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    // Selecionar o melhor agente
    const selectedAgent = await aiAgentService.selectBestAgent(message, context);

    // Processar mensagem com o agente selecionado
    const response = await aiAgentService.processMessage(
      selectedAgent,
      message,
      context,
      conversationHistory
    );

    res.json({
      success: true,
      data: {
        ...response,
        selectedAgent
      }
    });
  } catch (error) {
    logger.error('Erro no chat com IA:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Rota para testar agentes
router.post('/test', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Array de mensagens é obrigatório'
      });
    }

    const results = [];

    for (const testMessage of messages) {
      try {
        const selectedAgent = await aiAgentService.selectBestAgent(testMessage);
        const response = await aiAgentService.processMessage(selectedAgent, testMessage);
        
        results.push({
          message: testMessage,
          selectedAgent,
          response: response.message,
          confidence: response.confidence,
          success: true
        });
      } catch (error) {
        results.push({
          message: testMessage,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    logger.error('Erro no teste de agentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Obter estatísticas dos agentes
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const agents = aiAgentService.getAvailableAgents();
    
    // Aqui você pode implementar lógica para obter estatísticas reais
    // Por enquanto, retornamos dados mock
    const stats = {
      totalAgents: agents.length,
      agents: agents.map(agent => ({
        name: agent,
        status: 'active',
        messagesProcessed: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.floor(Math.random() * 2000) + 500,
        successRate: (Math.random() * 0.2 + 0.8).toFixed(2)
      })),
      totalMessagesProcessed: Math.floor(Math.random() * 5000),
      averageConfidence: (Math.random() * 0.3 + 0.7).toFixed(2)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Erro ao obter estatísticas dos agentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

export default router;
