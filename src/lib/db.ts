// src/lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Create a .env with DATABASE_URL (see README) before starting the app."
  );
}

function redactDbUrl(url: string) {
  return url.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

let dbHost: string;
try {
  dbHost = new URL(DATABASE_URL).hostname;
} catch {
  throw new Error(
    [
      "DATABASE_URL is not a valid URL.",
      "Fix your `.env` (no inline comments, correct quoting) or unset any shell-exported DATABASE_URL, then restart.",
      `Current (redacted): ${redactDbUrl(DATABASE_URL)}`,
    ].join(" ")
  );
}

// Dev-only guardrail: "base" was the root cause of local connection failures.
if (process.env.NODE_ENV !== "production" && dbHost === "base") {
  throw new Error(
    'DATABASE_URL hostname is "base". This usually means you exported DATABASE_URL in your shell. Run `unset DATABASE_URL` and restart `pnpm dev`, or update your env to use localhost.'
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pool =
  globalForPrisma.pgPool ?? new Pool({ connectionString: DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
