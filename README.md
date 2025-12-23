# Isha Practice Tracker

A full-stack habit/practice tracker built with **Next.js App Router + Prisma + Postgres**.
Goal: a clean “mid-level” codebase focused on real backend correctness (atomic updates, timezones, leaderboard queries).

## Features (current + planned)
- ✅ Local Postgres with Docker Compose
- ✅ Prisma schema + migrations
- ⏳ Practices config (ordered source of truth)
- ⏳ Auth (register/login/logout) using sessions + httpOnly cookies
- ⏳ “Done” endpoint with max-per-day enforcement (atomic)
- ⏳ Stats: today / week / month / all-time
- ⏳ Leaderboard with tie-break rules
- ⏳ Tests for business rules + sorting

## Tech Stack
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Postgres (Docker Compose)
- Prisma ORM

## Architecture (high level)

Browser
  -> Next.js pages (server components)
  -> Next.js route handlers (/app/api/*)
  -> Prisma client
  -> Postgres

## Getting Started

### 1) Install deps
```bash
pnpm install
