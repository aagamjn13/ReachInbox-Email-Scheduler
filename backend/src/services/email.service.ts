import prisma from '../config/database';
import { CreateCampaignDTO } from '../types/email.types';
import { scheduleEmailJob } from './scheduler.service';
import logger from '../utils/logger';

export const createCampaign = async (userId: string, data: CreateCampaignDTO) => {
  const { subject, body, requestedStartTime, requestedDelayMs, requestedHourlyLimit, recipients, senderAccountIds } = data;

  // Create Campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId,
      subject,
      body,
      requestedStartTime: requestedStartTime ? new Date(requestedStartTime) : new Date(),
      requestedDelayMs: requestedDelayMs || 2000,
      requestedHourlyLimit: requestedHourlyLimit || 200,
      totalRecipients: recipients.length,
    }
  });

  const emailsToCreate = [];
  
  let currentStartTime = campaign.requestedStartTime.getTime();
  let senderIndex = 0;

  for (let i = 0; i < recipients.length; i++) {
    const senderId = senderAccountIds[senderIndex];
    
    emailsToCreate.push({
      campaignId: campaign.id,
      senderAccountId: senderId,
      recipient: recipients[i],
      subject: campaign.subject,
      body: campaign.body,
      scheduledAt: new Date(currentStartTime),
      status: 'SCHEDULED' as const
    });

    // Round-robin senders
    senderIndex = (senderIndex + 1) % senderAccountIds.length;
    // Increment delay for the next email
    currentStartTime += campaign.requestedDelayMs;
  }

  // Bulk insert emails
  const createdEmails = await prisma.$transaction(
    emailsToCreate.map(email => prisma.email.create({ data: email }))
  );

  // Schedule them in BullMQ
  for (const email of createdEmails) {
    await scheduleEmailJob(email.id, email.scheduledAt);
  }

  logger.info(`Campaign ${campaign.id} created with ${createdEmails.length} emails scheduled.`);
  
  return campaign;
};
