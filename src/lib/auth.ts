import "server-only";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { SESSION_COOKIE_NAME } from "@/lib/cookies";

const MS_PER_DAY = 86_400_000;

function newSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function readPositiveInt(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function sessionTtlDays(): number {
  return readPositiveInt(process.env.SESSION_TTL_DAYS, 30);
}

function bcryptCost(): number {
  const cost = readPositiveInt(process.env.BCRYPT_COST, 10);
  if (cost < 8) return 8;
  if (cost > 14) return 14;
  return cost;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, bcryptCost());
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function computeSessionExpiry(): Date {
  return new Date(Date.now() + sessionTtlDays() * MS_PER_DAY);
}

export async function createSession(userId: string) {
  const token = newSessionToken();
  const expiresAt = computeSessionExpiry();

  await prisma.session.create({
    data: {
      userId,
      expiresAt,
      tokenHash: hashToken(token),
    },
  });

  return { token, expiresAt };
}

export async function deleteSessionById(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function deleteSessionByToken(token: string) {
  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const now = new Date();

  const session = await prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: now },
    },
    include: { user: true },
  });

  if (!session) return null;
  return session.user;
}

export function isUniqueConstraintError(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}
