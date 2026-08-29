import prisma from '../config/database';
import { scheduleEmailJob } from './scheduler.service';
import logger from '../utils/logger';

export const runRecovery = async () => {
  logger.info('Running recovery service for orphaned emails...');
  
  const orphanedEmails = await prisma.email.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { gte: new Date() }
    }
  });

  for (const email of orphanedEmails) {
    await scheduleEmailJob(email.id, email.scheduledAt);
  }

  logger.info(`Recovery complete. Re-scheduled ${orphanedEmails.length} emails.`);
};
