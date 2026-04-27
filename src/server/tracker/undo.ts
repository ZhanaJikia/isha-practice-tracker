import { prisma } from "@/lib/db";
import { dayKeyNow } from "@/lib/time";
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

  const practiceId = params.practiceId;

  const result = await prisma.$transaction(async (tx) => {
    const practice = await tx.practice.findUnique({
      where: { id: practiceId },
      select: { id: true, archivedAt: true },
    });
    if (!practice || practice.archivedAt) return { kind: "invalid_practice" } as const;

    const selected = await tx.userPractice.findUnique({
      where: { userId_practiceId: { userId: params.userId, practiceId } },
      select: { userId: true },
    });
    if (!selected) return { kind: "invalid_practice" } as const;

    const result = await undoCompletion(tx, { userId: params.userId, practiceId, dayKey, delta });
    return { kind: "ok", result } as const;
  });

  if (result.kind === "invalid_practice") return { kind: "invalid_practice" };
  return { kind: "ok", result: result.result, dayKey, practiceId };
}

