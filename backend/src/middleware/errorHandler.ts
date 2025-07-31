import { Request, Response, NextFunction } from 'express';
import { logger, logApiError } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log do erro
  logApiError(error, req, 'Error Handler');

  // Status code padrão
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';
  let code = error.code || 'INTERNAL_SERVER_ERROR';

  // Tratamento de erros específicos do MongoDB
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Dados de entrada inválidos';
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'ID inválido fornecido';
  }

  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Registro duplicado encontrado';
  }

  // Tratamento de erros JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Token de acesso inválido';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token de acesso expirado';
  }

  // Tratamento de erros de rate limiting
  if (error.message?.includes('Too many requests')) {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
    message = 'Muitas requisições. Tente novamente em alguns minutos.';
  }

  // Resposta de erro padronizada
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error.details
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Classe para criar erros customizados
export class CustomError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'CUSTOM_ERROR', details?: any) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Manter o stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Funções utilitárias para criar erros específicos
export const createValidationError = (message: string, details?: any) => {
  return new CustomError(message, 400, 'VALIDATION_ERROR', details);
};

export const createNotFoundError = (resource: string = 'Recurso') => {
  return new CustomError(`${resource} não encontrado`, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'Acesso não autorizado') => {
  return new CustomError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Acesso negado') => {
  return new CustomError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message: string, details?: any) => {
  return new CustomError(message, 409, 'CONFLICT', details);
};

export const createRateLimitError = () => {
  return new CustomError(
    'Muitas requisições. Tente novamente em alguns minutos.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
};

export const createExternalServiceError = (service: string, message?: string) => {
  return new CustomError(
    message || `Erro no serviço externo: ${service}`,
    502,
    'EXTERNAL_SERVICE_ERROR',
    { service }
  );
};
