import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow, parseDayKey } from "@/lib/time";
import { isPracticeKey } from "@/config/practices";

const QuerySchema = z.object({
  dayKey: z.string().optional(), // YYYY-MM-DD
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    dayKey: url.searchParams.get("dayKey") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dayKey = parsed.data.dayKey ?? dayKeyNow();

  try {
    parseDayKey(dayKey);
  } catch {
    return NextResponse.json({ error: "Invalid dayKey" }, { status: 400 });
  }

  const rows = await prisma.dailyPracticeCompletion.findMany({
    where: { userId: user.id, dayKey },
    select: {
      practiceId: true,
      count: true,
      lastCompletedAt: true,
      updatedAt: true,
    },
    orderBy: { practiceId: "asc" },
  });

  const completions = rows.filter((r) => isPracticeKey(r.practiceId));
  const byPracticeId = Object.fromEntries(completions.map((r) => [r.practiceId, r]));

  return NextResponse.json({ dayKey, completions, byPracticeId }, { status: 200 });
}
