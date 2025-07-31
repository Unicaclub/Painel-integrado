import winston from 'winston';
import path from 'path';

// Configuração do logger
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Criar diretório de logs se não existir
const logDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'painel-integrado-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    
    // File transport para erros
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport para todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  
  // Tratamento de exceções não capturadas
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  
  // Tratamento de rejeições não capturadas
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Se não estiver em produção, adicionar logs mais detalhados
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Função para log de requisições HTTP
export const logRequest = (req: any, res: any, responseTime: number) => {
  const { method, url, ip, headers } = req;
  const { statusCode } = res;
  
  logger.info('HTTP Request', {
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
    statusCode,
    responseTime: `${responseTime}ms`
  });
};

// Função para log de erros de API
export const logApiError = (error: Error, req: any, context?: string) => {
  const { method, url, ip, body, params, query } = req;
  
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    context,
    request: {
      method,
      url,
      ip,
      body,
      params,
      query
    }
  });
};

// Função para log de atividades de webhook
export const logWebhookActivity = (platform: string, event: string, data: any) => {
  logger.info('Webhook Activity', {
    platform,
    event,
    data: JSON.stringify(data, null, 2)
  });
};

// Função para log de atividades de IA
export const logAIActivity = (agent: string, action: string, input: any, output?: any) => {
  logger.info('AI Activity', {
    agent,
    action,
    input: typeof input === 'string' ? input : JSON.stringify(input),
    output: output ? (typeof output === 'string' ? output : JSON.stringify(output)) : undefined
  });
};

// Função para log de métricas de performance
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    metadata
  });
};

export default logger;
