import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();

// Login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Por enquanto, implementação simples para desenvolvimento
    // Em produção, você deve implementar autenticação real
    const mockUser = {
      id: '1',
      name: 'Usuário Demo',
      email: email,
      isFirstTime: false,
      isAuthenticated: true
    };

    return res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        message: 'Login realizado com sucesso'
      }
    });
  } catch (error: unknown) {
    logger.error('Erro no login:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Registro
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    // Implementação mock para desenvolvimento
    const mockUser = {
      id: Date.now().toString(),
      name,
      email,
      isFirstTime: true,
      isAuthenticated: true
    };

    return res.status(201).json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        message: 'Usuário criado com sucesso'
      }
    });
  } catch (error: unknown) {
    logger.error('Erro no registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

// Verificar token
router.get('/verify', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Implementação mock
    return res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: '1',
          name: 'Usuário Demo',
          email: 'demo@exemplo.com',
          isAuthenticated: true
        }
      }
    });
  } catch (error: unknown) {
    logger.error('Erro na verificação do token:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
}));

// Logout
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error: unknown) {
    logger.error('Erro no logout:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}));

export default router;
