import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

export const QUEUE_NAME = 'emails';

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: createRedisConnection('queue'),
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});
