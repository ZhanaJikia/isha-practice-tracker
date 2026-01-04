# Isha Practice Tracker

A full-stack habit / practice tracker built with **Next.js App Router + Prisma + Postgres**.

This project is intentionally focused on **mid-level backend correctness and architecture**, not UI polish:
- real session-based auth
- atomic updates with business rules
- timezone-safe stats
- clean separation of concerns

---

## Features

### Implemented
- ✅ Local Postgres via Docker Compose
- ✅ Prisma schema + migrations
- ✅ Practices config as single source of truth
- ✅ Auth: register / login / logout
  - httpOnly cookie sessions
  - hashed session tokens stored in DB
- ✅ “Done” / “Undo” endpoints
  - max-per-day enforcement
  - atomic updates
- ✅ Stats (weekly)
- ✅ Centralized API client + error handling
- ✅ Clean component + hook separation

### Planned
- ⏳ Monthly / all-time stats
- ⏳ Leaderboard with tie-break rules
- ⏳ Tests for business rules
- ⏳ UI polish

---

## Tech Stack
- **Next.js** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Postgres** (Docker Compose)
- **Prisma ORM**

---

## Architecture Overview

```
Browser
  → Next.js pages (app/*)
  → API route handlers (app/api/*)
  → Prisma client
  → Postgres
```

---

## Project Structure

```
src/
  app/
    api/
      login/
      logout/
      register/
      me/
      stats/
      done/
      undo/
    login/
      page.tsx          # /login route
    page.tsx            # main app page

  components/
    auth/
      AuthForm.tsx
      LogoutButton.tsx
    tracker/
      PracticesList.tsx
      PracticeRow.tsx
      StatsPanel.tsx
      useTrackerData.ts
      useTrackerActions.ts

  config/
    practices.ts        # practices source of truth
    uiText.ts           # user-facing strings

  lib/
    auth/
      session.ts        # session logic
      password.ts       # bcrypt helpers
    http/
      client.ts         # fetchJson wrapper
    db.ts
    cookies.ts
    time.ts
```


---

## Auth Model (Important)

- Passwords are hashed with **bcrypt**
- Sessions use **random high-entropy tokens**
- Only **token hashes** are stored in the database
- Raw session token is stored in an **httpOnly cookie**
- Cookies are sent automatically with API requests

This avoids:
- storing user IDs in cookies
- leaking session secrets
- client-side auth state bugs

---

## Getting Started

### 1) Install dependencies
```bash
pnpm install
```

---

### 2) Environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/isha_practice?schema=public

BCRYPT_COST=10
SESSION_TTL_DAYS=30
APP_TZ=Asia/Tbilisi
```

---

### 3) Database
```bash
docker compose up -d
pnpm db:migrate
pnpm db:seed   # optional
```

---

### 4) Run the app
```bash
pnpm dev
```

Open in browser:
- http://localhost:3000/login
- register or login
- then go to `/`

---

## Scripts

- `pnpm dev` – start dev server
- `pnpm build` / `pnpm start` – production build/run
- `pnpm lint` – ESLint
- `pnpm typecheck` – TypeScript
- `pnpm check` – lint + typecheck
- `pnpm db:*` – Prisma helpers

---

## Notes

- `BCRYPT_COST` is clamped between **8–14**
- Sessions expire after `SESSION_TTL_DAYS`
- All date logic is timezone-aware via `APP_TZ`
