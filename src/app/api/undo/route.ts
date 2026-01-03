import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow } from "@/lib/time";
import { isPracticeKey } from "@/config/practices";

const UndoSchema = z.object({
  practiceId: z.string(),
  delta: z.number().int().positive().max(50).optional(), // default 1
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = UndoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { practiceId } = parsed.data;
  const delta = parsed.data.delta ?? 1;

  if (!isPracticeKey(practiceId)) {
    return NextResponse.json({ error: "Unknown practiceId" }, { status: 400 });
  }

  const dayKey = dayKeyNow();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.dailyPracticeCompletion.findUnique({
        where: {
          userId_practiceId_dayKey: {
            userId: user.id,
            practiceId,
            dayKey,
          },
        },
        select: { id: true, count: true },
      });

      if (!existing) {
        return { kind: "noop" as const };
      }

      const nextCount = existing.count - delta;

      if (nextCount > 0) {
        const updated = await tx.dailyPracticeCompletion.update({
          where: { id: existing.id },
          data: { count: nextCount },
        });
        return { kind: "ok" as const, row: updated };
      }

      // nextCount <= 0 => delete row (keeps DB clean)
      await tx.dailyPracticeCompletion.delete({ where: { id: existing.id } });
      return { kind: "deleted" as const };
    });

    return NextResponse.json({ ok: true, result, dayKey, practiceId }, { status: 200 });
  } catch (e) {
    console.error("UNDO_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
