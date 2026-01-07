import { Prisma } from "@prisma/client";
import type { DailyPracticeCompletion } from "@prisma/client";

export type ApplyCompletionResult =
  | { kind: "ok"; row: DailyPracticeCompletion }
  | { kind: "max_reached"; count: number; maxPerDay: number };

type CompletionKey = { userId: string; practiceId: string; dayKey: string };

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
  if (!row) throw new Error("Invariant failed: completion row missing after increment");
  return row;
}

/**
 * Important: avoids unique violations inside the transaction.
 * Postgres aborts a transaction on ANY statement error (including unique constraint),
 * even if you catch the error in application code.
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

  // 1) Fast path: conditional increment (won't exceed max)
  const updated = await tryIncrement(tx, key, delta, maxPerDay, now);
  if (updated) return { kind: "ok", row: updated };

  // 2) Create without throwing on duplicates (prevents aborting the transaction)
  const created = await tx.dailyPracticeCompletion.createMany({
    data: [{ ...key, count: delta, lastCompletedAt: now }],
    skipDuplicates: true,
  });

  if (created.count === 1) {
    const row = await findRow(tx, key);
    if (!row) throw new Error("Invariant failed: completion row missing after createMany");
    return { kind: "ok", row };
  }

  // 3) Row already existed: retry increment; if it can't, we're maxed
  const retry = await tryIncrement(tx, key, delta, maxPerDay, now);
  if (retry) return { kind: "ok", row: retry };

  const count = await findCount(tx, key);
  return { kind: "max_reached", count, maxPerDay };
}