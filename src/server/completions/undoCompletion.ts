import { Prisma } from "@prisma/client";
import type { DailyPracticeCompletion } from "@prisma/client";

export type UndoCompletionResult =
  | { kind: "noop" }
  | { kind: "ok"; row: DailyPracticeCompletion }
  | { kind: "deleted" };

type CompletionKey = { userId: string; practiceId: string; dayKey: string };

async function findRow(tx: Prisma.TransactionClient, key: CompletionKey) {
  return tx.dailyPracticeCompletion.findUnique({
    where: { userId_practiceId_dayKey: key },
  });
}

/**
 * Decrement only when the row would stay > 0 afterwards.
 * This is concurrency-safe because Postgres will re-check the WHERE predicate after waiting on row locks.
 */
async function tryDecrement(
  tx: Prisma.TransactionClient,
  key: CompletionKey,
  delta: number
): Promise<DailyPracticeCompletion | null> {
  const res = await tx.dailyPracticeCompletion.updateMany({
    where: { ...key, count: { gt: delta } }, // strict: remaining count will be >= 1
    data: { count: { decrement: delta } },
  });

  if (res.count !== 1) return null;

  const row = await findRow(tx, key);
  if (!row) throw new Error("Invariant failed: completion row missing after decrement");
  return row;
}

/**
 * Delete only when count <= delta (i.e. undo would bring it to 0 or below).
 */
async function tryDelete(tx: Prisma.TransactionClient, key: CompletionKey, delta: number) {
  const res = await tx.dailyPracticeCompletion.deleteMany({
    where: { ...key, count: { lte: delta } },
  });

  return res.count > 0;
}

export async function undoCompletion(
  tx: Prisma.TransactionClient,
  params: { userId: string; practiceId: string; dayKey: string; delta: number }
): Promise<UndoCompletionResult> {
  const { userId, practiceId, dayKey, delta } = params;
  const key: CompletionKey = { userId, practiceId, dayKey };

  // 1) If it can decrement and stay > 0, do that.
  const dec = await tryDecrement(tx, key, delta);
  if (dec) return { kind: "ok", row: dec };

  // 2) Otherwise, if it would drop to <= 0, delete the row.
  const deleted = await tryDelete(tx, key, delta);
  if (deleted) return { kind: "deleted" };

  // 3) Row didn’t exist (or another request already deleted it)
  return { kind: "noop" };
}
