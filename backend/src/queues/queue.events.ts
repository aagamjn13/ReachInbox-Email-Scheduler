import { QueueEvents } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import logger from '../utils/logger';
import { QUEUE_NAME } from './email.queue';

let queueEvents: QueueEvents | null = null;

export const initQueueEvents = () => {
  queueEvents = new QueueEvents(QUEUE_NAME, {
    connection: createRedisConnection('queue-events'),
  });

  queueEvents.on('completed', ({ jobId }) => {
    logger.debug(`QueueEvent: Job ${jobId} completed`);
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.warn(`QueueEvent: Job ${jobId} failed: ${failedReason}`);
  });

  queueEvents.on('delayed', ({ jobId, delay }) => {
    logger.info(`QueueEvent: Job ${jobId} delayed by ${delay}ms`);
  });

  return queueEvents;
};

export const getQueueEvents = () => queueEvents;

export const closeQueueEvents = async () => {
  if (queueEvents) {
    await queueEvents.close();
    queueEvents = null;
  }
};
