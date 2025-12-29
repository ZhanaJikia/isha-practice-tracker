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
```

### 2) Environment
Create `.env` with at least:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isha
BCRYPT_COST=10            # clamped between 8-14
SESSION_TTL_DAYS=30       # session expiry in days
APP_TZ=Asia/Tbilisi       # optional, defaults to Asia/Tbilisi
```

### 3) Database
```bash
docker compose up -d        # start Postgres
pnpm db:migrate             # apply migrations
pnpm db:seed                # optional: seed data
```

### 4) Run
```bash
pnpm dev
```

## Requirements
- Node.js >= 20.9
- pnpm
- Docker (for local Postgres)

## Scripts
- `pnpm dev` – start dev server
- `pnpm build` / `pnpm start` – production build/run
- `pnpm lint` – runs `eslint .`
- `pnpm typecheck` – TS type check
- `pnpm check` – lint + typecheck
- `pnpm db:*` – Prisma helpers (generate, migrate, deploy, seed, reset, studio)

## Notes
- Auth hashing uses `BCRYPT_COST`, clamped to 8–14.
- Sessions expire after `SESSION_TTL_DAYS`; stored in Postgres via Prisma.
- Timezone-sensitive code defaults to `APP_TZ` (`Asia/Tbilisi` if unset).