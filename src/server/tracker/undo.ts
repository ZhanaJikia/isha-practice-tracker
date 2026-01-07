import { prisma } from "@/lib/db";
import { dayKeyNow } from "@/lib/time";
import { isPracticeKey } from "@/config/practices";
import { undoCompletion } from "@/server/completions/undoCompletion";

export type UndoResult =
  | { kind: "ok"; result: unknown; dayKey: string; practiceId: string }
  | { kind: "invalid_practice" };

export async function undo(params: {
  userId: string;
  practiceId: string;
  delta?: number;
  dayKey?: string;
}): Promise<UndoResult> {
  const dayKey = params.dayKey ?? dayKeyNow();
  const delta = params.delta ?? 1;

  if (!isPracticeKey(params.practiceId)) return { kind: "invalid_practice" };
  const practiceId = params.practiceId;

  const result = await prisma.$transaction((tx) =>
    undoCompletion(tx, { userId: params.userId, practiceId, dayKey, delta })
  );

  return { kind: "ok", result, dayKey, practiceId };
}

