# ReachInbox Email Scheduler

A full-stack email scheduling application built for the ReachInbox hiring assignment.

The system allows users to schedule emails for future delivery, process them through BullMQ and Redis, store state in PostgreSQL, send test emails through Ethereal SMTP, enforce sender-level rate limits, and view Scheduled and Sent emails from the dashboard.

No cron jobs are used.

## Features Implemented

### Backend
- Express.js + TypeScript
- PostgreSQL + Prisma
- BullMQ delayed jobs with Redis
- Persistent scheduling across restarts
- Startup recovery for incomplete/pending jobs
- Configurable BullMQ worker concurrency
- Per-sender hourly rate limiting using Redis
- Minimum delay between email sends
- Automatic rescheduling when rate limits are reached
- Multiple sender accounts
- Ethereal Email + Nodemailer
- Google OAuth 2.0
- Slack OAuth with rate-limit notifications
- Elasticsearch email indexing and search
- Bull Board queue dashboard
- Duplicate protection using BullMQ job IDs and database status checks

### Frontend
- React + TypeScript + Tailwind CSS
- Google OAuth login
- User name, email and avatar
- Logout
- Scheduled Emails dashboard
- Sent Emails dashboard
- Compose Email page
- Sender selection
- CSV/TXT recipient upload
- Recipient count and validation
- Subject and rich-text body
- Start time selection
- Delay between emails
- Hourly limit configuration
- Loading, empty and error states
- Elasticsearch-backed search

## Architecture Overview

```text
React Frontend
      |
      v
Express API
  |    |    |
  v    v    v
Postgres Redis Elasticsearch
          |
          v
      BullMQ Queue
          |
          v
      Email Worker
          |
          v
     Ethereal SMTP

Slack API <- Rate-limit notifications
```

## How Scheduling Works

1. The frontend sends the scheduling request to the backend.
2. A campaign and individual email records are stored in PostgreSQL.
3. Each recipient is added as a separate BullMQ delayed job.
4. BullMQ stores the jobs in Redis until their scheduled time.
5. When a job becomes due, the worker checks sender delay and hourly limits.
6. Allowed emails are sent using Ethereal SMTP.
7. Rate-limited emails are delayed and rescheduled instead of being dropped.
8. PostgreSQL is updated with the final email status.

## Persistence on Restart

PostgreSQL stores application state and Redis stores BullMQ jobs.

Because scheduled jobs are persisted in Redis, restarting the API or worker does not recreate campaigns from scratch.

A startup recovery service checks unresolved scheduled or processing emails and restores recoverable jobs when required.

## Rate Limiting & Concurrency

Worker concurrency is configurable:

```env
WORKER_CONCURRENCY=10
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

Redis-backed atomic logic enforces:

- minimum delay between emails from the same sender
- maximum emails per hour per sender

The limiter is safe across concurrent workers because counters are stored in Redis instead of process memory.

When the hourly limit is reached, the job is rescheduled to a later valid time and a Slack notification is sent if Slack is connected.

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` using `.env.example`.

Start PostgreSQL, Redis and Elasticsearch:

```bash
docker compose up -d
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply database schema:

```bash
npx prisma db push
```

Seed sender accounts if required:

```bash
npx tsx prisma/seed.ts
```

Start the backend:

```bash
npm run dev
```

If the BullMQ worker is configured as a separate process:

```bash
npm run dev:worker
```

Backend URL:

```text
http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Ethereal Email Setup

Create test SMTP accounts at:

```text
https://ethereal.email/
```

Add the credentials to `backend/.env`:

```env
ETHEREAL_SENDER_1_USER=
ETHEREAL_SENDER_1_PASS=

ETHEREAL_SENDER_2_USER=
ETHEREAL_SENDER_2_PASS=
```

Ethereal captures test emails and provides preview URLs instead of sending messages to real inboxes.

## Environment Variables

```env
NODE_ENV=development
PORT=5000

FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

DATABASE_URL=

REDIS_HOST=localhost
REDIS_PORT=6379

ELASTICSEARCH_NODE=http://localhost:9200

SESSION_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/slack/callback

ETHEREAL_SENDER_1_USER=
ETHEREAL_SENDER_1_PASS=
ETHEREAL_SENDER_2_USER=
ETHEREAL_SENDER_2_PASS=

WORKER_CONCURRENCY=10
MIN_EMAIL_DELAY_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200
```

## Assignment Requirement Mapping

### Backend

| Requirement | Implementation |
|---|---|
| Scheduler | BullMQ delayed jobs |
| Persistence | PostgreSQL + Redis |
| Restart recovery | Recovery/reconciliation service |
| Rate limiting | Redis-backed per-sender limiter |
| Minimum delay | Redis sender throttling |
| Concurrency | Configurable BullMQ worker |
| SMTP | Ethereal + Nodemailer |
| Multiple senders | Sender accounts |
| Search | Elasticsearch |
| Queue dashboard | Bull Board |
| Slack | Real OAuth + notifications |
| Authentication | Google OAuth |

### Frontend

| Requirement | Implementation |
|---|---|
| Login | Google OAuth |
| Dashboard | Scheduled and Sent views |
| Compose | Full compose interface |
| CSV/TXT upload | Supported |
| Recipient count | Supported |
| Start time | Supported |
| Delay | Supported |
| Hourly limit | Supported |
| Loading states | Implemented |
| Empty states | Implemented |
| Error handling | Implemented |

## Assumptions & Trade-offs

- Ethereal is used only for test SMTP delivery.
- Redis uses a fixed hourly rate-limit window.
- Higher worker concurrency improves throughput but may reduce strict ordering.
- PostgreSQL is the source of truth; Elasticsearch is only used for search.
- The system reduces duplicate sends using BullMQ job IDs and database status checks, but strict exactly-once SMTP delivery cannot be guaranteed if the process crashes after SMTP accepts a message but before the database records the success.
- For constrained demo hosting, the worker may run in the same deployment as the Express API. In a larger production system, workers would normally be deployed separately.
