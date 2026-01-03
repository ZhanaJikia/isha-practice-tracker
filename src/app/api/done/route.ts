import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow } from "@/lib/time";
import { PRACTICE_BY_KEY, isPracticeKey } from "@/config/practices";

const DoneSchema = z.object({
  practiceId: z.string(),
  delta: z.number().int().positive().max(50).optional(), // default 1
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = DoneSchema.safeParse(body);

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

  const practice = PRACTICE_BY_KEY[practiceId];
  // adjust this line to your config shape:
  const maxPerDay = practice.maxPerDay ?? 1;

  const dayKey = dayKeyNow();
  const now = new Date();

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
        if (delta > maxPerDay) {
          return { kind: "max_reached" as const, count: 0, maxPerDay };
        }

        const created = await tx.dailyPracticeCompletion.create({
          data: {
            userId: user.id,
            practiceId,
            dayKey,
            count: delta,
            lastCompletedAt: now,
          },
        });

        return { kind: "ok" as const, row: created };
      }

      if (existing.count + delta > maxPerDay) {
        return { kind: "max_reached" as const, count: existing.count, maxPerDay };
      }

      const updated = await tx.dailyPracticeCompletion.update({
        where: { id: existing.id },
        data: {
          count: { increment: delta },
          lastCompletedAt: now,
        },
      });

      return { kind: "ok" as const, row: updated };
    });

    if (result.kind === "max_reached") {
      return NextResponse.json(
        { error: "Max per day reached", count: result.count, maxPerDay, dayKey, practiceId },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { completion: result.row, dayKey, practiceId, maxPerDay },
      { status: 200 }
    );
  } catch (e) {
    console.error("DONE_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
