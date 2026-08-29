# ReachInbox - Email Job Scheduler

A production-grade email scheduler service and dashboard built for the ReachInbox hiring assignment. 

This system accepts email scheduling requests, persists them reliably in a PostgreSQL database, and schedules them using BullMQ and Redis. It features strict rate-limiting, crash-recovery, real Google OAuth, Slack notifications, and a Figma-perfect frontend dashboard.

## 🚀 Architecture Overview

### Core Scheduling & Persistence
- **No Cron Jobs:** Scheduling is driven entirely by **BullMQ's native delayed jobs**. When a campaign is created, emails are spaced out chronologically (using the user's requested delay) and pushed into the queue with a specific `delay` timestamp.
- **Idempotency:** Workers use atomic database locks (`UPDATE ... WHERE status = 'SCHEDULED'`) to "claim" an email before processing it. This guarantees that if multiple workers attempt to process the same job, the email is never sent twice.
- **Crash Recovery:** If the Node server crashes and reboots, a `recovery.service.ts` runs synchronously on startup. It scans the database for any emails still marked as `SCHEDULED` whose timestamps are in the past, and safely re-injects them into BullMQ.

### Concurrency & Rate Limiting
- **Worker Concurrency:** BullMQ worker concurrency is fully adjustable via the `WORKER_CONCURRENCY` environment variable.
- **Delay Between Sends:** The minimum delay between emails is strictly enforced at scheduling time (spaced out incrementally).
- **Hourly Rate Limiting:** Enforced via an **Atomic Redis Lua Script** (`rateLimit.service.ts`). It uses a fixed-window token bucket keyed by `rate-limit:{senderId}:{hourWindow}`. 
- **Graceful Rescheduling:** If the Lua script detects a rate limit breach, the worker **does not drop the job**. Instead, it pauses, updates the job to `RATE_LIMITED`, and pushes it back into BullMQ delayed exactly to the top of the next hour.
- **Slack Alerts:** The exact moment the limit is breached, the worker fires a webhook alert to the user's connected Slack channel.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Infrastructure:** PostgreSQL, Redis, Elasticsearch, BullMQ
- **Frontend:** React (Vite), Tailwind CSS, React Query, TipTap (Rich Text Editor)
- **Integrations:** Ethereal Email (SMTP), Google OAuth, Slack OAuth

---

## ⚙️ How to Run Locally

### 1. Prerequisites
Ensure you have Node.js (v18+) and Docker installed.

### 2. Infrastructure Setup
Start the required databases (Postgres, Redis, Elasticsearch) using Docker:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
```

Copy the environment file and fill in your keys:
```bash
cp .env.example .env
```
*Note: You must supply a valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the `.env` for login to work.*

Initialize the database and seed the dummy Ethereal sender accounts:
```bash
npm run db:push
npm run db:seed
```

Start the backend and worker processes:
```bash
npm run start
```
*The API will run on `http://localhost:5000`. The BullMQ Dashboard is available at `http://localhost:5000/admin/queues`.*

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`. Vite is configured to automatically proxy `/api` requests to the backend.*

---

## 📋 Features Implemented

### Backend
- ✅ **BullMQ Scheduler:** Delayed jobs (zero cron).
- ✅ **Persistence & Recovery:** PostgreSQL synced with Redis. Orphaned jobs survive restarts.
- ✅ **Distributed Rate Limiting:** Redis Lua scripts strictly enforce hourly limits per sender.
- ✅ **Concurrency Safe:** Atomic locking ensures zero duplicate sends under heavy load.
- ✅ **Slack OAuth:** Dynamic alerts pushed to Slack when rate limits are breached.
- ✅ **Elasticsearch Indexing:** Emails are indexed asynchronously upon being sent.

### Frontend
- ✅ **Google Login:** True OAuth 2.0 implementation via Passport.js.
- ✅ **Pixel-Perfect UI:** Closely matches the provided Figma design (Tailwind CSS).
- ✅ **Rich Text Editor:** Fully featured TipTap editor with exact custom toolbar.
- ✅ **CSV Upload:** Parses `.csv` and `.txt` files directly into recipient chips.
- ✅ **Dashboards:** Paginated tables for Scheduled and Sent emails with dynamic status badges.


## 📧 How to Set Up Ethereal Email & Environment Variables
Ethereal Email is a fake SMTP service used for testing. We have automated the creation of these accounts for you.
1. Fill out `.env` using `.env.example`.
2. When you run `npm run db:seed`, the script dynamically calls the Ethereal API to provision two completely new, real test accounts on the fly.
3. The script symmetrically encrypts their SMTP passwords using AES-256-GCM (using your `ENCRYPTION_KEY`) and stores them securely in your database. 
4. The worker decrypts them at runtime when sending emails.
You do not need to manually create Ethereal accounts unless you explicitly want to hardcode them in `.env`.

## ⚖️ Assumptions & Trade-offs
- **Fixed-Window vs Sliding-Window Rate Limiting:** We implemented a Fixed-Window token bucket (e.g., resets at the top of the hour) in Redis. A Sliding-Window approach is more accurate but requires `ZSET` range queries which are significantly heavier under high concurrency.
- **Microservices vs Monorepo:** We placed the API server and the BullMQ worker in the same backend codebase (though they run as entirely separate processes: `npm run start` vs `npm run start:worker`). This was done to share Prisma schemas and TypeScript types easily without setting up a private npm package or monorepo workspace.
- **TipTap Indentation:** TipTap's standard `StarterKit` does not support standard paragraph indentation (margin-left) out of the box. We wired the indent/outdent toolbar buttons to list-indentation (`sinkListItem`/`liftListItem`) which is the most common use-case in email formatting.
