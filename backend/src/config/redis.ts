import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redisClient.on('error', (error) => {
      logger.error('❌ Erro Redis:', error);
    });

    redisClient.on('connect', () => {
      logger.info('🔄 Conectando ao Redis...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis conectado e pronto');
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Conexão Redis encerrada');
    });

    await redisClient.connect();
    
  } catch (error) {
    logger.error('❌ Erro ao conectar Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client não inicializado');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis desconectado');
    }
  } catch (error) {
    logger.error('Erro ao desconectar Redis:', error);
    throw error;
  }
};

// Funções utilitárias para cache
export const setCache = async (key: string, value: any, expireInSeconds?: number): Promise<void> => {
  try {
    const client = getRedisClient();
    const serializedValue = JSON.stringify(value);
    
    if (expireInSeconds) {
      await client.setEx(key, expireInSeconds, serializedValue);
    } else {
      await client.set(key, serializedValue);
    }
  } catch (error) {
    logger.error('Erro ao definir cache:', error);
    throw error;
  }
};

export const getCache = async (key: string): Promise<any> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    logger.error('Erro ao obter cache:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('Erro ao deletar cache:', error);
    throw error;
  }
};

export const clearCachePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    logger.error('Erro ao limpar cache por padrão:', error);
    throw error;
  }
};
