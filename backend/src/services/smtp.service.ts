import nodemailer from 'nodemailer';
import { SenderAccount } from '@prisma/client';
import { decrypt } from '../utils/crypto';
import logger from '../utils/logger';

const transporters = new Map<string, nodemailer.Transporter>();

export const getTransporter = (account: SenderAccount): nodemailer.Transporter => {
  if (transporters.has(account.id)) {
    return transporters.get(account.id)!;
  }

  const password = decrypt(account.smtpPassword);
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpPort === 465,
    auth: {
      user: account.smtpUser,
      pass: password
    }
  });

  transporters.set(account.id, transporter);
  return transporter;
};

export const sendEmailViaSmtp = async (
  account: SenderAccount,
  to: string,
  subject: string,
  html: string
) => {
  const transporter = getTransporter(account);
  
  const info = await transporter.sendMail({
    from: `"${account.displayName}" <${account.email}>`,
    to,
    subject,
    html
  });

  return info;
};
