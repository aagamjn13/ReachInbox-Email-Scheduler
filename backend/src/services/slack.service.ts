import axios from 'axios';
import { env } from '../config/env';
import prisma from '../config/database';
import { encrypt, decrypt } from '../utils/crypto';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * Exchange Slack OAuth code for access token and store connection.
 */
export const handleSlackCallback = async (code: string, userId: string) => {
  const response = await axios.post(
    'https://slack.com/api/oauth.v2.access',
    new URLSearchParams({
      client_id: env.SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: env.SLACK_REDIRECT_URI,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (!response.data.ok) {
    throw new Error(`Slack OAuth failed: ${response.data.error}`);
  }

  const { access_token, team, incoming_webhook } = response.data;

  await prisma.slackConnection.upsert({
    where: { userId },
    update: {
      slackTeamId: team.id,
      slackTeamName: team.name,
      accessToken: encrypt(access_token),
      webhookUrl: incoming_webhook ? encrypt(incoming_webhook.url) : null,
      channelId: incoming_webhook?.channel_id || null,
      channelName: incoming_webhook?.channel || null,
    },
    create: {
      userId,
      slackTeamId: team.id,
      slackTeamName: team.name,
      accessToken: encrypt(access_token),
      webhookUrl: incoming_webhook ? encrypt(incoming_webhook.url) : null,
      channelId: incoming_webhook?.channel_id || null,
      channelName: incoming_webhook?.channel || null,
    },
  });
};

/**
 * Get Slack connection status for a user.
 */
export const getSlackStatus = async (userId: string) => {
  const connection = await prisma.slackConnection.findUnique({
    where: { userId },
    select: {
      id: true,
      slackTeamName: true,
      channelName: true,
    },
  });

  return {
    connected: !!connection,
    teamName: connection?.slackTeamName || undefined,
    channelName: connection?.channelName || undefined,
  };
};

/**
 * Disconnect Slack integration.
 */
export const disconnectSlack = async (userId: string) => {
  await prisma.slackConnection.delete({
    where: { userId },
  });
};

/**
 * Send Slack notification when a sender hits rate limit.
 * Uses Redis SET NX to prevent duplicate notifications per sender per hour.
 */
export const notifyRateLimitSlack = async (
  userId: string,
  senderId: string,
  senderEmail: string,
  hourlyLimit: number
) => {
  const hourBucket = Math.floor(Date.now() / 3600000);
  const cacheKey = `rate-limit-notified:${senderId}:${hourBucket}`;

  // Atomic SET NX — only the first worker in this hour window sends the notification
  const wasSet = await redisClient.set(cacheKey, '1', 'EX', 3600, 'NX');
  if (!wasSet) {
    logger.debug(`Slack rate-limit notification already sent for sender ${senderId} this hour`);
    return;
  }

  const connection = await prisma.slackConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    logger.debug(`No Slack connection for user ${userId}, skipping notification`);
    return;
  }

  if (!connection.webhookUrl) {
    logger.debug(`No Slack webhook URL for user ${userId}, skipping notification`);
    return;
  }

  const webhookUrl = decrypt(connection.webhookUrl);

  const message = {
    text: `⚠️ *Sender Rate Limit Reached*\n\n*Sender:* ${senderEmail}\n*Hourly limit:* ${hourlyLimit}\n\nRemaining emails have been automatically rescheduled.`,
  };

  try {
    await axios.post(webhookUrl, message);
    logger.info(`Slack notification sent: rate limit for sender ${senderEmail}`);
  } catch (error) {
    logger.error('Failed to send Slack notification:', error);
    // Do not throw — Slack failure should not affect email processing
  }
};
