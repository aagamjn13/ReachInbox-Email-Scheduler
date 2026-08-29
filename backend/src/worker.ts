import { createEmailWorker } from './queues/email.worker';
import logger from './utils/logger';
import prisma from './config/database';
import { runRecovery } from './services/recovery.service';

const startWorker = async () => {
  try {
    await prisma.$connect();
    logger.info('Worker connected to PostgreSQL');

    // Run recovery to ensure missed jobs are re-queued
    await runRecovery();

    const worker = createEmailWorker();
    
    worker.on('ready', () => {
      logger.info('BullMQ Email Worker is ready and processing jobs');
    });

    const shutdown = async () => {
      logger.info('Shutting down worker...');
      await worker.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
