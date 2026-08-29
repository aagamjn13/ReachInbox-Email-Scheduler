import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
};

/**
 * Factory to create new Redis connections.
 * BullMQ requires separate connections for Queue, Worker, and QueueEvents.
 */
export const createRedisConnection = (name?: string) => {
  const conn = new Redis(redisOptions);
  if (name) {
    conn.on('connect', () => {
      // Silent connection logging per instance
    });
  }
  return conn;
};

/**
 * Shared Redis client for general-purpose operations (rate limiting, sessions, etc.)
 * Do NOT use this for BullMQ — use createRedisConnection() instead.
 */
export const redisClient = createRedisConnection('shared');

/**
 * Get Redis connection options (for BullMQ connection config)
 */
export const getRedisConnectionOptions = (): RedisOptions => ({ ...redisOptions });
