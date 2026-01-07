# Isha Practice Tracker

A full-stack practice / habit tracker built with **Next.js (App Router)**, **Prisma**, and **Postgres**.

This repo is intentionally focused on **Backend correctness** (not UI polish):
- **Session auth** with httpOnly cookies
- **Atomic business rules** (max-per-day, undo) via DB transactions
- **Timezone-safe day keys** and stats
- **Clear separation**: API route handlers → domain logic → DB

---

## Tech Stack

- **Next.js** (App Router, Route Handlers)
- **TypeScript**
- **Prisma** + **Postgres**
- **TailwindCSS**
- **Zod** (request validation)

---

## Core Concepts

### Sessions (Auth)
- Users authenticate with **username + password**.
- Passwords are hashed with **bcrypt** (`BCRYPT_COST` is clamped in code).
- Sessions use a **random token**; only the **token hash** is stored in the DB.
- The raw token is stored in an **httpOnly cookie** (`SESSION_COOKIE_NAME`).
- Request flow: cookie token → hash → DB lookup → user.

### Time / Day Keys
- The tracker uses `dayKey` as `"YYYY-MM-DD"` in a configured timezone (`APP_TZ`).
- All per-day aggregation uses `dayKey` (not local machine time).

### Tracker Rules
- **Done** increments count but enforces **maxPerDay**.
- **Undo** decrements count and deletes the row when it reaches 0.
- Updates run inside **transactions** to be safe under concurrent requests.

---

## Project Structure

```
.
├─ docker-compose.yml
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ completions/route.ts
│  │  │  ├─ done/route.ts
│  │  │  ├─ health/route.ts
│  │  │  ├─ login/route.ts
│  │  │  ├─ logout/route.ts
│  │  │  ├─ me/route.ts
│  │  │  ├─ practices/route.ts
│  │  │  ├─ register/route.ts
│  │  │  ├─ stats/route.ts
│  │  │  └─ undo/route.ts
│  │  ├─ components/
│  │  │  ├─ auth/
│  │  │  └─ tracker/
│  │  ├─ login/page.tsx
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ config/
│  │  ├─ practices.ts
│  │  └─ uiText.ts
│  ├─ lib/
│  │  ├─ auth.ts
│  │  ├─ cookies.ts
│  │  ├─ db.ts
│  │  ├─ time.ts
│  │  └─ http/
│  │     ├─ api.ts
│  │     ├─ client.ts
│  │     └─ errors.ts
│  └─ server/
│     └─ tracker/
│        └─ done.ts
└─ README.md
```

---

## API Overview

### Auth
- `POST /api/register` → create user + set session cookie
- `POST /api/login` → validate credentials + set session cookie
- `POST /api/logout` → delete session + clear cookie
- `GET /api/me` → current user (401 if not logged in)

### Tracker
- `GET /api/practices` → list practices from config
- `GET /api/completions?dayKey=YYYY-MM-DD` → day completions (defaults to today)
- `POST /api/done` `{ practiceId, delta? }` → increment (max-per-day enforced)
- `POST /api/undo` `{ practiceId, delta? }` → decrement (deletes row at 0)
- `GET /api/stats?range=today|week|month|all&dayKey=YYYY-MM-DD` → aggregated stats

---

## Environment Variables

Create a `.env` file in the repo root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/isha_practice?schema=public"
APP_TZ="Asia/Tbilisi"
BCRYPT_COST="10"
SESSION_TTL_DAYS="30"
SESSION_COOKIE_NAME="isha_session"
```

---

## Getting Started

### 1) Install
```bash
pnpm install
```

### 2) Start Postgres
```bash
docker compose up -d
```

### 3) Migrate (and optionally seed)
```bash
pnpm db:migrate
pnpm db:seed
```

### 4) Run
```bash
pnpm dev
```

Open:
- `/login` to register/login
- `/` for the tracker UI

---

## Testing (integration)

These tests run against a **real Postgres test DB** via Prisma + transactions.

### 1) Create the test database
With the Docker DB running:

```bash
docker exec -it isha_tracker_db psql -U postgres -c "CREATE DATABASE isha_practice_test;"
```

### 2) Create `.env.test`
Create a `.env.test` file in the repo root:

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

Note:
- `pnpm test` loads `.env.test` via `dotenv-cli`.
- The integration suite asserts `DATABASE_URL` contains `isha_practice_test` as a safety check.

---

## Quality Gates (local)

This repo uses **Husky** to run checks automatically:

- `pre-commit` → `pnpm check` (eslint + typecheck)
- `pre-push` → `pnpm test` (integration tests)

If you need to bypass hooks temporarily (not recommended), you can use `git commit --no-verify` / `git push --no-verify`.

---

## Scripts

- `pnpm dev` – start dev server
- `pnpm build` / `pnpm start` – production build/run
- `pnpm lint` – eslint
- `pnpm typecheck` – tsc --noEmit
- `pnpm check` – lint + typecheck
- `pnpm test` – run tests (Vitest, loads `.env.test`)
- `pnpm test:watch` – watch mode
- `pnpm db:*` – Prisma helpers (`generate`, `migrate`, `seed`, etc.)

---

## Conventions

- API request validation uses **Zod**.
- API error responses are standardized in `src/lib/http/errors.ts`.
- Keep business rules in `src/server/**` and keep route handlers thin.
