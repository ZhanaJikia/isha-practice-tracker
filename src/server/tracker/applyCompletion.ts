import { Prisma } from "@prisma/client";
import type { DailyPracticeCompletion } from "@prisma/client";

export type ApplyCompletionResult =
  | { kind: "ok"; row: DailyPracticeCompletion }
  | { kind: "max_reached"; count: number; maxPerDay: number };

type CompletionKey = { userId: string; practiceId: string; dayKey: string };

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

async function findRow(tx: Prisma.TransactionClient, key: CompletionKey) {
  return tx.dailyPracticeCompletion.findUnique({
    where: { userId_practiceId_dayKey: key },
  });
}

async function findCount(tx: Prisma.TransactionClient, key: CompletionKey) {
  const row = await tx.dailyPracticeCompletion.findUnique({
    where: { userId_practiceId_dayKey: key },
    select: { count: true },
  });
  return row?.count ?? 0;
}

async function tryIncrement(
  tx: Prisma.TransactionClient,
  key: CompletionKey,
  delta: number,
  maxPerDay: number,
  now: Date
): Promise<DailyPracticeCompletion | null> {
  const res = await tx.dailyPracticeCompletion.updateMany({
    where: { ...key, count: { lte: maxPerDay - delta } },
    data: { count: { increment: delta }, lastCompletedAt: now },
  });

  if (res.count !== 1) return null;

  const row = await findRow(tx, key);
  // Should exist after successful updateMany. If not, something is inconsistent.
  if (!row) throw new Error("Invariant failed: completion row missing after increment");
  return row;
}

async function createRow(
  tx: Prisma.TransactionClient,
  key: CompletionKey,
  delta: number,
  now: Date
): Promise<DailyPracticeCompletion> {
  return tx.dailyPracticeCompletion.create({
    data: { ...key, count: delta, lastCompletedAt: now },
  });
}

/**
 * Concurrency-safe completion increment:
 * - Enforces maxPerDay for (userId, practiceId, dayKey)
 * - Safe under parallel requests (uses conditional update + unique-create fallback)
 */
export async function applyCompletion(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    practiceId: string;
    dayKey: string;
    delta: number;
    maxPerDay: number;
    now: Date;
  }
): Promise<ApplyCompletionResult> {
  const { userId, practiceId, dayKey, delta, maxPerDay, now } = params;
  const key: CompletionKey = { userId, practiceId, dayKey };

  if (delta > maxPerDay) return { kind: "max_reached", count: 0, maxPerDay };

  // Fast path: conditional increment (won't exceed max)
  const updated = await tryIncrement(tx, key, delta, maxPerDay, now);
  if (updated) return { kind: "ok", row: updated };

  // If row doesn't exist, create it. If it races, retry increment.
  try {
    const created = await createRow(tx, key, delta, now);
    return { kind: "ok", row: created };
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;

    const retry = await tryIncrement(tx, key, delta, maxPerDay, now);
    if (retry) return { kind: "ok", row: retry };

    const count = await findCount(tx, key);
    return { kind: "max_reached", count, maxPerDay };
  }
}
