import OpenAI from 'openai';
import { logger, logAIActivity } from '@/utils/logger';
import { getCache, setCache } from '@/config/redis';

export interface AIAgentConfig {
  name: string;
  role: string;
  personality: string;
  instructions: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  message: string;
  agent: string;
  confidence: number;
  suggestedActions?: string[];
  metadata?: any;
}

class AIAgentService {
  private openai: OpenAI;
  private agents: Map<string, AIAgentConfig>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.agents = new Map();
    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Agente Vendedor
    this.agents.set('vendedor', {
      name: 'vendedor',
      role: 'Especialista em Vendas',
      personality: 'Persuasivo, empático e focado em resultados',
      instructions: `Você é um especialista em vendas com foco em marketing digital. Suas responsabilidades incluem:

1. QUALIFICAÇÃO DE LEADS:
   - Identificar potencial de compra
   - Descobrir necessidades e dores
   - Avaliar orçamento e autoridade de decisão

2. ESTRATÉGIAS DE CONVERSÃO:
   - Criar argumentos de venda personalizados
   - Sugerir ofertas e promoções
   - Desenvolver sequências de follow-up

3. OTIMIZAÇÃO DE CAMPANHAS:
   - Analisar métricas de conversão
   - Sugerir melhorias em copy e criativos
   - Identificar oportunidades de upsell/cross-sell

4. COMUNICAÇÃO:
   - Sempre responda em português brasileiro
   - Use linguagem persuasiva mas não agressiva
   - Foque em benefícios, não apenas recursos
   - Inclua calls-to-action claros

Mantenha um tom profissional, confiante e orientado a resultados.`,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000
    });

    // Agente Suporte
    this.agents.set('suporte', {
      name: 'suporte',
      role: 'Especialista em Atendimento',
      personality: 'Paciente, prestativo e solucionador de problemas',
      instructions: `Você é um especialista em atendimento ao cliente focado em resolver problemas rapidamente. Suas responsabilidades incluem:

1. RESOLUÇÃO DE PROBLEMAS:
   - Diagnosticar issues técnicos
   - Fornecer soluções passo-a-passo
   - Escalar problemas complexos quando necessário

2. ORIENTAÇÃO DE USO:
   - Explicar funcionalidades da plataforma
   - Guiar usuários através de processos
   - Criar tutoriais personalizados

3. GESTÃO DE EXPECTATIVAS:
   - Comunicar prazos realistas
   - Manter clientes informados sobre progresso
   - Gerenciar situações de insatisfação

4. COMUNICAÇÃO:
   - Sempre responda em português brasileiro
   - Use linguagem clara e didática
   - Seja empático e compreensivo
   - Ofereça múltiplas soluções quando possível

Mantenha um tom amigável, profissional e focado na solução.`,
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 800
    });

    // Agente Promoter
    this.agents.set('promoter', {
      name: 'promoter',
      role: 'Especialista em Marketing de Conteúdo',
      personality: 'Criativo, engajador e conhecedor de tendências',
      instructions: `Você é um especialista em marketing de conteúdo e engajamento. Suas responsabilidades incluem:

1. CRIAÇÃO DE CONTEÚDO:
   - Desenvolver posts para redes sociais
   - Criar campanhas de email marketing
   - Sugerir conteúdo viral e engajador

2. ESTRATÉGIA DE ENGAJAMENTO:
   - Identificar melhores horários para postagem
   - Sugerir hashtags relevantes
   - Criar calls-to-action efetivos

3. ANÁLISE DE TENDÊNCIAS:
   - Monitorar trends do mercado
   - Adaptar conteúdo para diferentes plataformas
   - Sugerir colaborações e parcerias

4. OTIMIZAÇÃO DE ALCANCE:
   - Melhorar SEO de conteúdo
   - Aumentar engajamento orgânico
   - Desenvolver estratégias de growth hacking

5. COMUNICAÇÃO:
   - Sempre responda em português brasileiro
   - Use linguagem criativa e inspiradora
   - Inclua emojis e elementos visuais quando apropriado
   - Foque em storytelling e conexão emocional

Mantenha um tom criativo, inspirador e orientado ao engajamento.`,
      model: 'gpt-4',
      temperature: 0.8,
      maxTokens: 1200
    });

    logger.info('✅ Agentes de IA inicializados:', Array.from(this.agents.keys()));
  }

  async processMessage(
    agentName: string,
    message: string,
    context?: any,
    conversationHistory?: ChatMessage[]
  ): Promise<AIResponse> {
    try {
      const agent = this.agents.get(agentName);
      if (!agent) {
        throw new Error(`Agente '${agentName}' não encontrado`);
      }

      // Verificar cache para respostas similares
      const cacheKey = `ai_response:${agentName}:${Buffer.from(message).toString('base64').slice(0, 50)}`;
      const cachedResponse = await getCache(cacheKey);
      
      if (cachedResponse) {
        logger.info(`Cache hit para agente ${agentName}`);
        return cachedResponse;
      }

      // Construir mensagens para o OpenAI
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: agent.instructions
        }
      ];

      // Adicionar histórico de conversa se fornecido
      if (conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory.slice(-10)); // Últimas 10 mensagens
      }

      // Adicionar contexto se fornecido
      if (context) {
        messages.push({
          role: 'system',
          content: `Contexto adicional: ${JSON.stringify(context)}`
        });
      }

      // Adicionar mensagem do usuário
      messages.push({
        role: 'user',
        content: message
      });

      logAIActivity(agentName, 'processing_message', message);

      // Chamar OpenAI
      const completion = await this.openai.chat.completions.create({
        model: agent.model,
        messages: messages as any,
        temperature: agent.temperature,
        max_tokens: agent.maxTokens,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const responseMessage = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      // Calcular confiança baseada na resposta
      const confidence = this.calculateConfidence(completion);

      // Extrair ações sugeridas (se houver)
      const suggestedActions = this.extractSuggestedActions(responseMessage);

      const aiResponse: AIResponse = {
        message: responseMessage,
        agent: agentName,
        confidence,
        suggestedActions,
        metadata: {
          model: agent.model,
          tokensUsed: completion.usage?.total_tokens || 0,
          processingTime: Date.now()
        }
      };

      // Cache da resposta por 1 hora
      await setCache(cacheKey, aiResponse, 3600);

      logAIActivity(agentName, 'response_generated', message, responseMessage);

      return aiResponse;

    } catch (error) {
      logger.error(`Erro no agente ${agentName}:`, error);
      throw error;
    }
  }

  private calculateConfidence(completion: any): number {
    // Lógica simples para calcular confiança
    const choice = completion.choices[0];
    if (!choice) return 0;

    let confidence = 0.5; // Base

    // Aumentar confiança se a resposta foi completada
    if (choice.finish_reason === 'stop') {
      confidence += 0.3;
    }

    // Aumentar confiança baseado no tamanho da resposta
    const messageLength = choice.message?.content?.length || 0;
    if (messageLength > 100) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  private extractSuggestedActions(message: string): string[] {
    const actions: string[] = [];
    
    // Procurar por padrões de ação
    const actionPatterns = [
      /(?:recomendo|sugiro|deveria|pode|tente)[\s\w]*([^.!?]+)/gi,
      /(?:próximo passo|próxima etapa)[\s:]*([^.!?]+)/gi,
      /(?:ação|fazer|executar)[\s:]*([^.!?]+)/gi
    ];

    actionPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        actions.push(...matches.slice(0, 3)); // Máximo 3 ações por padrão
      }
    });

    return actions.slice(0, 5); // Máximo 5 ações sugeridas
  }

  async getAgentCapabilities(agentName: string): Promise<any> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agente '${agentName}' não encontrado`);
    }

    return {
      name: agent.name,
      role: agent.role,
      personality: agent.personality,
      capabilities: this.getCapabilitiesByAgent(agentName)
    };
  }

  private getCapabilitiesByAgent(agentName: string): string[] {
    const capabilities: Record<string, string[]> = {
      vendedor: [
        'Qualificação de leads',
        'Estratégias de conversão',
        'Análise de métricas de vendas',
        'Criação de argumentos de venda',
        'Otimização de campanhas',
        'Sequências de follow-up'
      ],
      suporte: [
        'Resolução de problemas técnicos',
        'Orientação de uso da plataforma',
        'Criação de tutoriais',
        'Gestão de expectativas',
        'Escalação de problemas',
        'Atendimento personalizado'
      ],
      promoter: [
        'Criação de conteúdo para redes sociais',
        'Estratégias de engajamento',
        'Análise de tendências',
        'Otimização de alcance',
        'Campanhas de email marketing',
        'Growth hacking'
      ]
    };

    return capabilities[agentName] || [];
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  async selectBestAgent(message: string, context?: any): Promise<string> {
    // Lógica para selecionar o melhor agente baseado na mensagem
    const messageLower = message.toLowerCase();
    
    // Palavras-chave para cada agente
    const keywords = {
      vendedor: ['venda', 'comprar', 'preço', 'orçamento', 'proposta', 'conversão', 'lead', 'cliente'],
      suporte: ['problema', 'erro', 'ajuda', 'como', 'não funciona', 'bug', 'dúvida', 'tutorial'],
      promoter: ['conteúdo', 'post', 'engajamento', 'viral', 'hashtag', 'campanha', 'criativo', 'trend']
    };

    let bestAgent = 'suporte'; // Padrão
    let maxScore = 0;

    for (const [agent, agentKeywords] of Object.entries(keywords)) {
      const score = agentKeywords.reduce((acc, keyword) => {
        return acc + (messageLower.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestAgent = agent;
      }
    }

    // Considerar contexto se fornecido
    if (context?.platform) {
      if (context.platform === 'whatsapp' && messageLower.includes('vend')) {
        bestAgent = 'vendedor';
      }
    }

    logger.info(`Agente selecionado: ${bestAgent} (score: ${maxScore})`);
    return bestAgent;
  }
}

export const aiAgentService = new AIAgentService();
