import type { Prisma, DailyPracticeCompletion } from "@prisma/client";

export type DoneResult =
  | { kind: "ok"; row: DailyPracticeCompletion }
  | { kind: "max_reached"; count: number; maxPerDay: number };

type Key = { userId: string; practiceId: string; dayKey: string };

function isUniqueViolation(e: unknown): boolean {
  // Prisma unique constraint violation (P2002)
  if (!e || typeof e !== "object") return false;
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/61dcf881-21e5-4676-b8e9-1cebecb865b5", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "prefix",
      hypothesisId: "H3",
      location: "server/tracker/done.ts:isUniqueViolation",
      message: "Checking unique violation",
      data: { hasCode: "code" in e ? (e as { code?: string }).code : undefined },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return "code" in e && (e as { code?: string }).code === "P2002";
}

async function getRow(tx: Prisma.TransactionClient, key: Key) {
  return tx.dailyPracticeCompletion.findUnique({
    where: { userId_practiceId_dayKey: key },
  });
}

async function getCount(tx: Prisma.TransactionClient, key: Key) {
  const row = await tx.dailyPracticeCompletion.findUnique({
    where: { userId_practiceId_dayKey: key },
    select: { count: true },
  });
  return row?.count ?? 0;
}

async function tryIncrement(
  tx: Prisma.TransactionClient,
  key: Key,
  delta: number,
  maxPerDay: number,
  now: Date
): Promise<DailyPracticeCompletion | null> {
  const res = await tx.dailyPracticeCompletion.updateMany({
    where: { ...key, count: { lte: maxPerDay - delta } },
    data: { count: { increment: delta }, lastCompletedAt: now },
  });

  if (res.count !== 1) return null;
  return getRow(tx, key);
}

async function tryCreate(
  tx: Prisma.TransactionClient,
  key: Key,
  delta: number,
  now: Date
): Promise<DailyPracticeCompletion> {
  return tx.dailyPracticeCompletion.create({
    data: { ...key, count: delta, lastCompletedAt: now },
  });
}

/**
 * Concurrency-safe "done":
 * - increments count up to maxPerDay per (user, practice, dayKey)
 * - safe under parallel requests
 */
export async function applyDone(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    practiceId: string;
    dayKey: string;
    delta: number;
    maxPerDay: number;
    now: Date;
  }
): Promise<DoneResult> {
  const { userId, practiceId, dayKey, delta, maxPerDay, now } = params;
  const key: Key = { userId, practiceId, dayKey };

  if (delta > maxPerDay) return { kind: "max_reached", count: 0, maxPerDay };

  const updated = await tryIncrement(tx, key, delta, maxPerDay, now);
  if (updated) return { kind: "ok", row: updated };

  try {
    const created = await tryCreate(tx, key, delta, now);
    return { kind: "ok", row: created };
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;

    const retry = await tryIncrement(tx, key, delta, maxPerDay, now);
    if (retry) return { kind: "ok", row: retry };

    const count = await getCount(tx, key);
    return { kind: "max_reached", count, maxPerDay };
  }
}
