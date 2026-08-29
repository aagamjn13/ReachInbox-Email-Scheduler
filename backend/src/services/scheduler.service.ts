import { emailQueue } from '../queues/email.queue';
import logger from '../utils/logger';

export const scheduleEmailJob = async (emailId: string, scheduledAt: Date) => {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  
  await emailQueue.add(
    'send-email',
    { emailId },
    {
      jobId: emailId, // Deduplication via jobId
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      }
    }
  );
  
  logger.info(`Scheduled job for email ${emailId} with delay ${delay}ms`);
};
