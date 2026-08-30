# ReachInbox Email Scheduler

A full-stack application for scheduling, queuing, and sending emails reliably. This system guarantees that emails are never lost, even during server crashes, and strictly enforces rate limits and throttles to prevent spam or SMTP rejections.

## ?? Features Implemented

### Backend
- **Reliable Scheduler:** Powered by BullMQ and Redis to handle precise future execution.
- **Persistence on Restart:** PostgreSQL database tracks email state (SCHEDULED, PROCESSING, SENT, FAILED). A boot-up recovery script automatically requeues any emails that were orphaned or interrupted during a server crash.
- **Rate Limiting & Throttling:** Built-in atomic Redis Lua script limits emails sent per hour per sender account. Also enforces a configurable minimum delay (e.g., 2 seconds) between emails to prevent burst rejection.
- **Embedded Worker Architecture:** The BullMQ worker runs in the same Node.js process as the Express API to conserve memory on free-tier hosting (Render).
- **Slack Integration:** OAuth integration to send a Slack notification when a sender hits their hourly limit.

### Frontend
- **Authentication:** Google OAuth 2.0 integration for secure user login.
- **Dashboard UI:** Real-time tables to view "Scheduled" and "Sent" emails, complete with status badges.
- **Compose Interface:** Rich text editor for creating emails, selecting specific sender accounts, and defining custom scheduling parameters (Hourly Limit, Delay, Start Time).

---

## ?? Demo Video
[INSERT YOUR 5-MINUTE DEMO VIDEO LINK HERE]

*(The video demonstrates creating scheduled campaigns, the dashboard updating, simulated server restarts to show persistence, and rate-limiting behavior).*

---

## ?? Architecture Overview

### How Scheduling Works
When a user schedules an email, the backend saves it to the PostgreSQL database with a SCHEDULED status. It calculates the time difference between 
ow and the equestedStartTime, and pushes a job to the Redis-backed BullMQ queue with a delay parameter. BullMQ holds the job in a suspended "Delayed" state until the exact millisecond arrives.

### How Persistence on Restart is Handled
If the backend server crashes or is manually restarted, the in-memory state is lost, but the queue state lives safely in Redis (Upstash) and PostgreSQL. 
When the server boots up, ecovery.service.ts runs. It queries the database for any emails stuck in PROCESSING (meaning the server crashed mid-send) and resets them. It then forcefully clears any ghost cache in BullMQ and re-adds all un-sent SCHEDULED emails to the front of the BullMQ queue.

### How Rate Limiting & Concurrency are Implemented
The BullMQ worker operates with a concurrency limit (e.g., 10 parallel jobs). 
When a job is picked up, it passes through ateLimit.service.ts. This service uses a custom Redis Lua script to atomically check and increment the sender's usage for the current hour bucket.
- If the sender has exceeded their Hourly Limit, the job is marked as RATE_LIMITED and moved back into BullMQ's delayed queue for 1 hour.
- If the email violates the Minimum Delay (e.g. 2 seconds since the last email), it is pushed back into the queue for 2 seconds.

---

## ?? Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Redis instance

### 1. Set up Ethereal Email & Environment Variables
Create a .env file in the ackend/ directory using the .env.example file.
For email sending, the system uses [Ethereal Email](https://ethereal.email/). 
*(Note: If you leave these blank during the database seeding step, the script will automatically generate dummy Ethereal accounts and securely encrypt their passwords in your database!)*

### 2. Run the Backend
`ash
cd backend
npm install
# Generate Prisma types and push schema
npx prisma generate
npx prisma db push
# Seed the database (creates demo user and Ethereal senders)
npx tsx prisma/seed.ts
# Start the API server & Worker
npm run dev
`

### 3. Run the Frontend
Open a new terminal tab:
`ash
cd frontend
npm install
npm run dev
`

---

## ?? Trade-offs & Assumptions

1. **Embedded Worker vs Dedicated Worker:** I chose to run the BullMQ worker in the exact same process as the Express API. While a production system handling millions of emails would ideally separate these into distinct microservices, combining them prevents Out-Of-Memory (OOM) crashes on Render's 512MB free tier.
2. **Fixed-Window vs Sliding-Window Rate Limiting:** We implemented a Fixed-Window token bucket (resets at the top of the hour) in Redis. A Sliding-Window approach is more accurate but requires ZSET range queries which are significantly heavier under high concurrency.
3. **Elasticsearch:** The backend contains code to index emails into Elasticsearch. However, since there is no free-tier hosted Elasticsearch available, this feature is built to gracefully degrade. If the ES cluster is unreachable, the API falls back to standard PostgreSQL text search.
4. **Attachments:** The frontend UI includes an "Attachments" button for composing emails, but this is purely a dummy UI element. Implementing true file attachments would require an AWS S3 bucket for blob storage, which was deemed out of scope.
