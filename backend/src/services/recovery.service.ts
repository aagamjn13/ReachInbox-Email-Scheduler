import prisma from '../config/database';
import { scheduleEmailJob } from './scheduler.service';
import logger from '../utils/logger';

export const runRecovery = async () => {
  logger.info('Running recovery service for orphaned and stuck emails...');
  
  // 1. Reset any emails stuck in PROCESSING back to SCHEDULED
  // (This happens if the server crashes while the worker is sending an email)
  const stuckCount = await prisma.email.updateMany({
    where: { status: 'PROCESSING' },
    data: { status: 'SCHEDULED' }
  });

  if (stuckCount.count > 0) {
    logger.warn(`Reset ${stuckCount.count} stuck PROCESSING emails back to SCHEDULED`);
  }

  // 2. Re-queue SCHEDULED emails that might have missed their BullMQ jobs
  const orphanedEmails = await prisma.email.findMany({
    where: {
      status: 'SCHEDULED',
    }
  });

  for (const email of orphanedEmails) {
    await scheduleEmailJob(email.id, email.scheduledAt);
  }

  logger.info(`Recovery complete. Re-scheduled ${orphanedEmails.length} emails.`);
};
