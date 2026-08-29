import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });
const emailQueue = new Queue('emails', { connection });

async function check() {
  const delayed = await emailQueue.getDelayed();
  const waiting = await emailQueue.getWaiting();
  const active = await emailQueue.getActive();
  const failed = await emailQueue.getFailed();
  const completed = await emailQueue.getCompleted();
  console.log(`Delayed: ${delayed.length}`);
  console.log(`Waiting: ${waiting.length}`);
  console.log(`Active: ${active.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Completed: ${completed.length}`);
  if (delayed.length > 0) {
    console.log('Sample delayed job:', delayed[0].id, 'delay:', delayed[0].delay, 'timestamp:', delayed[0].timestamp);
  }
  process.exit(0);
}
check();
