import { prisma } from "@/lib/db";
import { dayKeyNow } from "@/lib/time";
import { applyCompletion } from "@/server/tracker/applyCompletion";

export type DoneResult =
  | {
      kind: "ok";
      completion: unknown;
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
  const practiceId = params.practiceId;

  const result = await prisma.$transaction(async (tx) => {
    const practice = await tx.practice.findFirst({
      where: {
        id: practiceId,
        archivedAt: null,
        userPractices: { some: { userId: params.userId } },
      },
      select: { id: true, maxPerDay: true },
    });

    if (!practice) return { kind: "invalid_practice" } as const;

    const applied = await applyCompletion(tx, {
      userId: params.userId,
      practiceId,
      dayKey,
      delta,
      maxPerDay: practice.maxPerDay,
      now,
    });

    return { kind: "applied", applied, maxPerDay: practice.maxPerDay } as const;
  });

  if (result.kind === "invalid_practice") return { kind: "invalid_practice" };

  if (result.applied.kind === "max_reached") {
    return {
      kind: "max_reached",
      practiceId,
      dayKey,
      maxPerDay: result.applied.maxPerDay,
      count: result.applied.count,
    };
  }

  return {
    kind: "ok",
    completion: result.applied.row,
    dayKey,
    practiceId,
    maxPerDay: result.maxPerDay,
  };
}