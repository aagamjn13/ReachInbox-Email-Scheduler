import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  ELASTICSEARCH_NODE: z.string().url().default('http://localhost:9200'),
  SESSION_SECRET: z.string().min(10),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  SLACK_CLIENT_ID: z.string(),
  SLACK_CLIENT_SECRET: z.string(),
  SLACK_REDIRECT_URI: z.string().url(),
  WORKER_CONCURRENCY: z.string().transform(Number).default('10'),
  MIN_EMAIL_DELAY_MS: z.string().transform(Number).default('2000'),
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.string().transform(Number).default('200'),
  ENCRYPTION_KEY: z.string().length(64),
  BULL_BOARD_USERNAME: z.string().default('admin'),
  BULL_BOARD_PASSWORD: z.string().default('admin123'),
  ETHEREAL_SENDER_1_NAME: z.string().optional(),
  ETHEREAL_SENDER_1_EMAIL: z.string().optional(),
  ETHEREAL_SENDER_1_USER: z.string().optional(),
  ETHEREAL_SENDER_1_PASS: z.string().optional(),
  ETHEREAL_SENDER_2_NAME: z.string().optional(),
  ETHEREAL_SENDER_2_EMAIL: z.string().optional(),
  ETHEREAL_SENDER_2_USER: z.string().optional(),
  ETHEREAL_SENDER_2_PASS: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
