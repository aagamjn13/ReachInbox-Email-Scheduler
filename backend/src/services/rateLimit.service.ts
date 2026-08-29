import { redisClient } from '../config/redis';
import { env } from '../config/env';
import logger from '../utils/logger';

// Returns { allowed: true/false, retryAt: timestamp }
// Atomically checks hourly limit and min delay
const rateLimitScript = `
  local hourlyKey = KEYS[1]
  local lastSendKey = KEYS[2]
  local hourlyLimit = tonumber(ARGV[1])
  local minDelayMs = tonumber(ARGV[2])
  local nowStr = ARGV[3]
  local now = tonumber(nowStr)
  local nextHourStr = ARGV[4]
  local nextHour = tonumber(nextHourStr)
  
  local hourlyCount = tonumber(redis.call('GET', hourlyKey) or '0')
  local lastSend = tonumber(redis.call('GET', lastSendKey) or '0')
  
  if hourlyCount >= hourlyLimit then
    return { 0, nextHour }
  end
  
  if (now - lastSend) < minDelayMs then
    return { 0, lastSend + minDelayMs }
  end
  
  redis.call('INCR', hourlyKey)
  redis.call('EXPIRE', hourlyKey, 3600)
  
  redis.call('SET', lastSendKey, nowStr)
  
  return { 1, 0 }
`;

export const checkRateLimit = async (
  senderId: string, 
  hourlyLimit: number = env.MAX_EMAILS_PER_HOUR_PER_SENDER,
  minDelayMs: number = env.MIN_EMAIL_DELAY_MS
): Promise<{ allowed: boolean; retryAt?: number }> => {
  const now = Date.now();
  const hourBucket = Math.floor(now / 3600000);
  const nextHour = (hourBucket + 1) * 3600000;
  
  const hourlyKey = `rate:sender:${senderId}:${hourBucket}`;
  const lastSendKey = `rate:lastsend:${senderId}`;
  
  try {
    const result = await redisClient.eval(
      rateLimitScript,
      2,
      hourlyKey,
      lastSendKey,
      hourlyLimit.toString(),
      minDelayMs.toString(),
      now.toString(),
      nextHour.toString()
    ) as [number, number];
    
    const allowed = result[0] === 1;
    const retryAt = result[1];
    
    return { allowed, retryAt: allowed ? undefined : retryAt };
  } catch (error) {
    logger.error('Rate limit check failed:', error);
    // Fail safe to false to prevent spam
    return { allowed: false, retryAt: now + 5000 };
  }
};
