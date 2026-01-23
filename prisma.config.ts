import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    [
      "DATABASE_URL is not set.",
      "For local dev, create a `.env` with DATABASE_URL (see README).",
      "For Vercel, add DATABASE_URL in Project Settings → Environment Variables for the target environment (Preview/Production).",
    ].join(" ")
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url: DATABASE_URL },
});