# Isha Practice Tracker

A full-stack practice / habit tracker built with **Next.js (App Router)**, **Prisma**, and **Postgres**, designed to showcase **backend correctness**:

- **Session auth** (httpOnly cookies, token hashing)
- **Atomic business rules** (max-per-day, undo) enforced via DB transactions
- **Timezone-safe day keys** and aggregation for stats
- **Predictable API errors** (standardized error payloads; Zod `treeifyError`)
- **Quality gates** (integration tests + CI + Git hooks)

## Live Demo (Vercel)

- **Login**: [isha-practice-tracker (Vercel)](https://isha-practice-tracker-9lxkd7myg-zhanajikias-projects.vercel.app/login)

---

## What this project demonstrates

- **Clean boundaries**: Next.js Route Handlers are thin; domain logic lives in `src/server/**`.
- **Concurrency safety**: the “done/undo” logic uses conditional `updateMany` + transactions to remain correct under concurrent requests.
- **Operational realism**: migrations in CI, real Postgres integration tests, and deploy-ready env var strategy.

---

## Architecture

**Flow** (happy path):

1. UI calls `src/lib/http/api.ts` (typed client wrappers)
2. Route Handler validates input with Zod (`z.treeifyError(...)` for consistent details)
3. Route Handler calls domain logic in `src/server/**`
4. Domain logic uses Prisma (transactions where needed)
5. Response returns either a success payload or standardized error payload

**Standard error shape**:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid input", "details": { "field": ["msg"] } }
}
```

---

## Tech Stack

### Runtime

- **Next.js 16** (App Router, Route Handlers)
- **React 19**
- **TypeScript**
- **Postgres 16**
- **Prisma 7** (config-based datasource via `prisma.config.ts`)

### Backend / domain

- **Zod**: request/query validation, `z.treeifyError` for structured error details
- **bcrypt**: password hashing (cost clamped in code)
- **crypto**: session token generation + token hashing
- **Luxon**: timezone-aware day keys (`APP_TZ`)

### Frontend/UI (minimal on purpose)

- **Tailwind CSS v4** + `tailwind-merge` + `clsx`
- **Radix UI** (Separator)
- **lucide-react** (icons)
- **sonner** (toasts)
- **next-themes**
- **tw-animate-css**

### Tooling / quality

- **Vitest**: integration tests (Node env)
- **dotenv-cli**: load `.env.test` for `pnpm test`
- **ESLint** + **Next.js ESLint config**
- **Husky**: pre-commit / pre-push hooks
- **GitHub Actions**: CI on PRs + `main`

---

## Data Model (Prisma)

- **User**
  - `username` unique
  - `passwordHash`
- **Session**
  - Stores **only `tokenHash`** (raw token never stored)
  - Has `expiresAt` + indexes for cleanup/lookup
- **DailyPracticeCompletion**
  - `(userId, practiceId, dayKey)` unique
  - `dayKey` is `"YYYY-MM-DD"` computed in `APP_TZ`
  - `count`, `lastCompletedAt`, `updatedAt`

---

## Business Rules (core logic)

### “Done” (increment)

Domain entrypoint: `src/server/tracker/done.ts`  
Atomic core: `src/server/tracker/applyCompletion.ts`

- Enforces \(count + delta \le maxPerDay\)
- Concurrency-safe approach:
  - Conditional increment via `updateMany(where count <= maxPerDay - delta)`
  - If missing row, `createMany({ skipDuplicates: true })` to avoid transaction abort due to unique violations (Postgres aborts a transaction on *any* statement error)
  - Retry increment; otherwise return `max_reached`

### “Undo” (decrement)

Domain entrypoint: `src/server/tracker/undo.ts`  
Atomic core: `src/server/completions/undoCompletion.ts`

- If count stays \(\ge 1\), decrements via conditional `updateMany(where count > delta)`
- If undo would drop to \(\le 0\), deletes row
- If row doesn’t exist, returns noop

---

## API (Route Handlers)

### Auth

- `POST /api/register` → create user + set session cookie
- `POST /api/login` → validate credentials + set session cookie
- `POST /api/logout` → delete session + clear cookie
- `GET /api/me` → current user (401 if not logged in)

### Tracker / Stats

- `GET /api/practices` → list practices from config
- `GET /api/completions?dayKey=YYYY-MM-DD` → day completions (defaults to today in `APP_TZ`)
- `POST /api/done` `{ practiceId, delta? }` → increment (max-per-day enforced)
- `POST /api/undo` `{ practiceId, delta? }` → decrement (deletes row at 0)
- `GET /api/stats?range=today|week|month|all&dayKey=YYYY-MM-DD&days=7..365` → aggregated stats

---

## Project Structure (high signal)

```
.
├─ docker-compose.yml
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ prisma.config.ts
├─ src/
│  ├─ app/
│  │  └─ api/                 # Next.js Route Handlers (thin)
│  ├─ config/                 # Practices config + UI text
│  ├─ lib/                    # DB, auth helpers, time helpers, HTTP client
│  └─ server/                 # Domain logic (transactions, invariants)
│     ├─ auth/
│     ├─ stats/
│     ├─ tracker/
│     └─ __tests__/           # Integration tests (real Postgres)
└─ README.md
```

---

## Local Development

### Requirements

- Node.js **20+**
- pnpm **9+**
- Docker (for Postgres)

### 1) Install

```bash
pnpm install
```

### 2) Start Postgres (Docker)

```bash
docker compose up -d
```

### 3) Configure env

Create `.env` in the repo root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/isha_practice?schema=public"
APP_TZ="Asia/Tbilisi"
BCRYPT_COST="10"
SESSION_TTL_DAYS="30"
SESSION_COOKIE_NAME="isha_session"
```

### 4) Migrate (and optionally seed)

```bash
pnpm db:migrate
pnpm db:seed
```

### 5) Run

```bash
pnpm dev
```

Open:

- `/login` to register/login
- `/` for the tracker UI

---

## Testing (integration)

Tests run against a **real Postgres test database** via Prisma transactions.

### 1) Create the test database

With the Docker DB running:

```bash
docker exec -it isha_tracker_db psql -U postgres -c "CREATE DATABASE isha_practice_test;"
```

### 2) Create `.env.test`

Create `.env.test` in the repo root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/isha_practice_test?schema=public"
```

### 3) Apply migrations to the test DB

```bash
pnpm db:deploy
```

### 4) Run tests

```bash
pnpm test
```

Notes:

- `pnpm test` loads `.env.test` via `dotenv-cli`.
- The integration suite asserts `DATABASE_URL` contains `isha_practice_test` as a safety check.

---

## Quality Gates (local)

This repo uses **Husky** to run checks automatically:

- `pre-commit` → `pnpm check` (eslint + typecheck)
- `pre-push` → `pnpm test` (integration tests)

If you need to bypass hooks temporarily (not recommended), you can use `git commit --no-verify` / `git push --no-verify`.

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

- Runs on PRs and pushes to `main`
- Steps:
  - `pnpm install --frozen-lockfile`
  - `pnpm check`
  - Postgres service
  - `pnpm db:deploy`
  - `pnpm test`

---

## Deploy (Vercel)

### Required env vars

Set these in **Vercel → Project → Settings → Environment Variables**:

- `DATABASE_URL` (Production + Preview)
- `APP_TZ`
- `BCRYPT_COST`
- `SESSION_TTL_DAYS`
- `SESSION_COOKIE_NAME`

### Migrations on deploy

Set **Build Command** to:

```bash
pnpm db:deploy && pnpm build
```

---

## Scripts

- `pnpm dev` – start dev server
- `pnpm build` / `pnpm start` – production build/run
- `pnpm lint` – eslint
- `pnpm typecheck` – tsc --noEmit
- `pnpm check` – lint + typecheck
- `pnpm test` – run tests (Vitest, loads `.env.test`)
- `pnpm test:watch` – watch mode
- `pnpm db:*` – Prisma helpers (`generate`, `migrate`, `deploy`, `seed`, etc.)
