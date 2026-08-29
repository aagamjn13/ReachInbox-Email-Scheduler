import app from './app';
import { env } from './config/env';
import logger from './utils/logger';
import prisma from './config/database';
import { initElasticsearch } from './config/elasticsearch';
import { runRecovery } from './services/recovery.service';
import { initQueueEvents } from './queues/queue.events';

const startServer = async () => {
  try {
    // Database connection test
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');

    // Initialize ES index
    await initElasticsearch();

    // Init Queue Events
    initQueueEvents();

    // Run recovery to pick up stranded jobs
    await runRecovery();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
