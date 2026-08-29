import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
    requestedStartTime: z.string().datetime().optional(),
    requestedDelayMs: z.number().int().min(1000).optional(),
    requestedHourlyLimit: z.number().int().min(1).optional(),
    recipients: z.array(z.string().email()).min(1),
    senderAccountIds: z.array(z.string().uuid()).min(1),
  }),
});
