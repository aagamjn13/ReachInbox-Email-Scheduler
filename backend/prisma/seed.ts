import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { encrypt } from '../src/utils/crypto';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'demo@reachinbox.com' },
    update: {},
    create: {
      email: 'demo@reachinbox.com',
      name: 'Demo User',
      googleId: 'demo-google-id-123'
    }
  });

  console.log(`Created user: ${user.email}`);

  // Create Ethereal test accounts if not provided
  let account1 = {
    user: env.ETHEREAL_SENDER_1_USER,
    pass: env.ETHEREAL_SENDER_1_PASS,
  };

  if (!account1.user) {
    console.log('Generating Ethereal Account 1...');
    account1 = await nodemailer.createTestAccount();
  }

  let account2 = {
    user: env.ETHEREAL_SENDER_2_USER,
    pass: env.ETHEREAL_SENDER_2_PASS,
  };

  if (!account2.user) {
    console.log('Generating Ethereal Account 2...');
    account2 = await nodemailer.createTestAccount();
  }

  // Create sender accounts
  const sender1 = await prisma.senderAccount.create({
    data: {
      userId: user.id,
      displayName: env.ETHEREAL_SENDER_1_NAME || 'Sender One',
      email: env.ETHEREAL_SENDER_1_EMAIL || account1.user || '',
      smtpHost: 'smtp.ethereal.email',
      smtpPort: 587,
      smtpUser: account1.user || '',
      smtpPassword: encrypt(account1.pass || ''),
      active: true,
    }
  });

  const sender2 = await prisma.senderAccount.create({
    data: {
      userId: user.id,
      displayName: env.ETHEREAL_SENDER_2_NAME || 'Sender Two',
      email: env.ETHEREAL_SENDER_2_EMAIL || account2.user || '',
      smtpHost: 'smtp.ethereal.email',
      smtpPort: 587,
      smtpUser: account2.user || '',
      smtpPassword: encrypt(account2.pass || ''),
      active: true,
    }
  });

  console.log(`Created sender accounts: ${sender1.email}, ${sender2.email}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
