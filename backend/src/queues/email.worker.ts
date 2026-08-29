import { Worker, Job, DelayedError } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import prisma from '../config/database';
import { checkRateLimit } from '../services/rateLimit.service';
import { sendEmailViaSmtp } from '../services/smtp.service';
import { indexEmail } from '../services/search.service';
import { notifyRateLimitSlack } from '../services/slack.service';
import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { env } from '../config/env';
import { QUEUE_NAME } from './email.queue';

export const createEmailWorker = () => {
  const worker = new Worker(QUEUE_NAME, async (job: Job, token?: string) => {
    const { emailId } = job.data;
    logger.info(`Processing email job ${job.id} for email ${emailId}`);

    // 1. Fetch email with relations
    const email = await prisma.email.findUnique({
      where: { id: emailId },
      include: {
        senderAccount: true,
        campaign: true,
      },
    });

    if (!email) {
      logger.warn(`Email ${emailId} not found in database. Skipping.`);
      return;
    }

    // 2. Idempotency: only process SCHEDULED or RATE_LIMITED emails
    if (email.status !== 'SCHEDULED' && email.status !== 'RATE_LIMITED') {
      logger.info(`Email ${emailId} status is ${email.status}, skipping.`);
      return;
    }

    // 3. Atomically claim the email (prevent duplicate sends)
    const claimedCount = await prisma.$executeRaw`
      UPDATE "emails"
      SET "status" = 'PROCESSING'::"EmailStatus", "updatedAt" = NOW()
      WHERE "id" = ${emailId}::uuid
        AND "status" IN ('SCHEDULED'::"EmailStatus", 'RATE_LIMITED'::"EmailStatus")
    `;

    if (claimedCount === 0) {
      logger.info(`Email ${emailId} already claimed by another worker.`);
      return;
    }

    const { senderAccount, campaign } = email;

    // 4. Check rate limit (atomic Redis Lua script)
    const effectiveHourlyLimit = Math.min(
      campaign.requestedHourlyLimit,
      env.MAX_EMAILS_PER_HOUR_PER_SENDER
    );
    const effectiveMinDelay = Math.max(
      campaign.requestedDelayMs,
      env.MIN_EMAIL_DELAY_MS
    );

    const { allowed, retryAt } = await checkRateLimit(
      senderAccount.id,
      effectiveHourlyLimit,
      effectiveMinDelay
    );

    if (!allowed && retryAt && token) {
      logger.warn(`Rate limited: sender ${senderAccount.email}, rescheduling to ${new Date(retryAt).toISOString()}`);

      // Revert to RATE_LIMITED status
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'RATE_LIMITED' },
      });

      // Send Slack notification (deduped per sender per hour)
      await notifyRateLimitSlack(
        campaign.userId,
        senderAccount.id,
        senderAccount.email,
        effectiveHourlyLimit
      );

      // Reschedule the BullMQ job
      await job.moveToDelayed(retryAt, token);
      throw new DelayedError();
    }

    // 5. Send the email via SMTP
    try {
      const info = await sendEmailViaSmtp(
        senderAccount,
        email.recipient,
        email.subject,
        email.body
      );

      const etherealPreviewUrl = nodemailer.getTestMessageUrl(info as any) || null;

      // 6. Update DB to SENT
      const sentEmail = await prisma.email.update({
        where: { id: emailId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          etherealMessageId: info.messageId,
          etherealPreviewUrl: etherealPreviewUrl ? String(etherealPreviewUrl) : null,
        },
      });

      logger.info(`Email ${emailId} sent successfully. MessageId: ${info.messageId}`);

      // 7. Index to Elasticsearch (non-blocking)
      try {
        await indexEmail({
          id: sentEmail.id,
          campaignId: sentEmail.campaignId,
          userId: campaign.userId,
          senderEmail: senderAccount.email,
          recipient: sentEmail.recipient,
          subject: sentEmail.subject,
          body: sentEmail.body,
          status: sentEmail.status,
          scheduledAt: sentEmail.scheduledAt,
          sentAt: sentEmail.sentAt,
          createdAt: sentEmail.createdAt,
        });
      } catch (esError) {
        logger.error(`Elasticsearch indexing failed for email ${emailId}:`, esError);
        // Do NOT roll back SMTP send for ES failures
      }

      return { success: true, messageId: info.messageId };
    } catch (smtpError: any) {
      logger.error(`SMTP send failed for email ${emailId}:`, smtpError);

      await prisma.email.update({
        where: { id: emailId },
        data: {
          status: 'FAILED',
          failureReason: smtpError.message || 'Unknown SMTP error',
        },
      });

      throw smtpError; // Let BullMQ handle retries
    }
  }, {
    connection: createRedisConnection('worker'),
    concurrency: env.WORKER_CONCURRENCY,
    limiter: {
      max: env.MAX_EMAILS_PER_HOUR_PER_SENDER,
      duration: 3600000,
    },
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    if (err instanceof DelayedError) return; // Expected for rate-limited rescheduling
    logger.error(`Job ${job?.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error('Worker error:', err);
  });

  return worker;
};
