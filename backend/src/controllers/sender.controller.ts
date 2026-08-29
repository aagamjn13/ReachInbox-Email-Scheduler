import { Request, Response } from 'express';
import prisma from '../config/database';
import { encrypt } from '../utils/crypto';

export const getSenderAccounts = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  let accounts = await prisma.senderAccount.findMany({
    where: { userId, active: true },
    select: {
      id: true,
      displayName: true,
      email: true,
      smtpHost: true,
      smtpPort: true,
      createdAt: true
    }
  });

  // Auto-provision a test account for new users
  if (accounts.length === 0) {
    const newAccount = await prisma.senderAccount.create({
      data: {
        userId,
        displayName: req.user!.name || 'My Test Sender',
        email: req.user!.email,
        smtpHost: 'smtp.ethereal.email',
        smtpPort: 587,
        smtpUser: process.env.ETHEREAL_SENDER_1_USER || 'moriah.mcglynn38@ethereal.email',
        smtpPassword: encrypt(process.env.ETHEREAL_SENDER_1_PASS || '12345password'),
        active: true,
      }
    });
    accounts = [{
      id: newAccount.id,
      displayName: newAccount.displayName,
      email: newAccount.email,
      smtpHost: newAccount.smtpHost,
      smtpPort: newAccount.smtpPort,
      createdAt: newAccount.createdAt
    }];
  }

  res.json({ accounts });
};
