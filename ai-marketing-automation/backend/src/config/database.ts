import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painel-integrado';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB conectado com sucesso');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ Erro na conexão MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB desconectado');
    });

  } catch (error) {
    logger.error('❌ Erro ao conectar MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB desconectado');
  } catch (error) {
    logger.error('Erro ao desconectar MongoDB:', error);
    throw error;
  }
};
