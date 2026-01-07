import { prisma } from "@/lib/db";
import { dayKeyNow } from "@/lib/time";
import { PRACTICE_BY_KEY, isPracticeKey } from "@/config/practices";
import { applyCompletion } from "@/server/tracker/applyCompletion";

export type DoneResult =
  | {
      kind: "ok";
      completion: unknown; // keep it unknown here if you don’t want to import Prisma types
      dayKey: string;
      practiceId: string;
      maxPerDay: number;
    }
  | {
      kind: "max_reached";
      practiceId: string;
      dayKey: string;
      maxPerDay: number;
      count: number;
    }
  | { kind: "invalid_practice" };

export async function done(params: {
  userId: string;
  practiceId: string;
  delta?: number;
  dayKey?: string;
  now?: Date;
}): Promise<DoneResult> {
  const dayKey = params.dayKey ?? dayKeyNow();
  const now = params.now ?? new Date();
  const delta = params.delta ?? 1;

  if (!isPracticeKey(params.practiceId)) return { kind: "invalid_practice" };
  const practiceId = params.practiceId;
  const maxPerDay = PRACTICE_BY_KEY[practiceId].maxPerDay;

  const result = await prisma.$transaction((tx) =>
    applyCompletion(tx, {
      userId: params.userId,
      practiceId,
      dayKey,
      delta,
      maxPerDay,
      now,
    })
  );

  if (result.kind === "max_reached") {
    return {
      kind: "max_reached",
      practiceId,
      dayKey,
      maxPerDay: result.maxPerDay,
      count: result.count,
    };
  }

  return { kind: "ok", completion: result.row, dayKey, practiceId, maxPerDay };
}

