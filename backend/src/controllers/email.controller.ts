import { Request, Response } from 'express';
import { createCampaign } from '../services/email.service';
import { searchEmails } from '../services/search.service';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const scheduleEmails = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Verify sender account belongs to user
  if (req.body.senderAccountId) {
    const sender = await prisma.senderAccount.findFirst({
      where: { id: req.body.senderAccountId, userId },
    });
    if (!sender) {
      return res.status(403).json({ error: 'Sender account does not belong to you' });
    }
  }

  const campaign = await createCampaign(userId, req.body);

  // Get email schedule summary
  const emails = await prisma.email.findMany({
    where: { campaignId: campaign.id },
    orderBy: { scheduledAt: 'asc' },
    select: { scheduledAt: true },
  });

  res.status(201).json({
    campaignId: campaign.id,
    totalRecipients: campaign.totalRecipients,
    firstScheduledAt: emails[0]?.scheduledAt,
    lastScheduledAt: emails[emails.length - 1]?.scheduledAt,
  });
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.EmailWhereInput = {
    campaign: { userId },
    status: { in: ['SCHEDULED', 'RATE_LIMITED', 'PROCESSING'] },
  };

  const [data, total] = await Promise.all([
    prisma.email.findMany({
      where,
      include: { senderAccount: { select: { id: true, displayName: true, email: true, active: true } } },
      orderBy: { scheduledAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.email.count({ where }),
  ]);

  res.json({
    data,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const getSentEmails = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.EmailWhereInput = {
    campaign: { userId },
    status: { in: ['SENT', 'FAILED'] },
  };

  const [data, total] = await Promise.all([
    prisma.email.findMany({
      where,
      include: { senderAccount: { select: { id: true, displayName: true, email: true, active: true } } },
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.email.count({ where }),
  ]);

  res.json({
    data,
    total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const getEmailById = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const email = await prisma.email.findFirst({
    where: {
      id: id as string,
      campaign: { userId },
    },
    include: {
      senderAccount: { select: { id: true, displayName: true, email: true, active: true } },
      campaign: { select: { id: true, subject: true, requestedStartTime: true } },
    },
  });

  if (!email) {
    return res.status(404).json({ error: 'Email not found' });
  }

  res.json(email);
};

export const search = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const query = req.query.q as string;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const results = await searchEmails(userId, query.trim(), page, limit);
  res.json(results);
};
