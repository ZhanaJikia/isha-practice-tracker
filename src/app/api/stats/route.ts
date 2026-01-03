import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow, parseDayKey, weekStartDayKey, monthStartDayKey } from "@/lib/time";
import { PRACTICE_BY_KEY, PRACTICES, isPracticeKey } from "@/config/practices";

const QuerySchema = z.object({
  range: z.enum(["today", "week", "month", "all"]).optional(),
  // optional anchor day (useful later for browsing history)
  dayKey: z.string().optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    range: url.searchParams.get("range") ?? undefined,
    dayKey: url.searchParams.get("dayKey") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const range = parsed.data.range ?? "week";
  const asOfDayKey = parsed.data.dayKey ?? dayKeyNow();

  try {
    parseDayKey(asOfDayKey);
  } catch {
    return NextResponse.json({ error: "Invalid dayKey" }, { status: 400 });
  }

  let startDayKey: string | null = null;
  let endDayKey: string | null = null;

  if (range === "today") {
    startDayKey = asOfDayKey;
    endDayKey = asOfDayKey;
  } else if (range === "week") {
    startDayKey = weekStartDayKey(asOfDayKey);
    endDayKey = asOfDayKey;
  } else if (range === "month") {
    startDayKey = monthStartDayKey(asOfDayKey);
    endDayKey = asOfDayKey;
  } else {
    // "all"
    startDayKey = null;
    endDayKey = null;
  }

  const whereRange =
    startDayKey && endDayKey
      ? {
          dayKey: {
            gte: startDayKey,
            lte: endDayKey,
          },
        }
      : {};

  // 1) aggregate counts per practice
  const grouped = await prisma.dailyPracticeCompletion.groupBy({
    by: ["practiceId"],
    where: {
      userId: user.id,
      ...whereRange,
    },
    _sum: { count: true },
  });

  // 2) count how many distinct days have any completion in the range
  const days = await prisma.dailyPracticeCompletion.groupBy({
    by: ["dayKey"],
    where: {
      userId: user.id,
      ...whereRange,
    },
    _sum: { count: true },
  });

  // Build per-practice result using your PRACTICES config as the source of truth/order
  const countByPractice: Record<string, number> = {};
  for (const g of grouped) {
    if (!isPracticeKey(g.practiceId)) continue;
    countByPractice[g.practiceId] = g._sum.count ?? 0;
  }

  const perPractice = PRACTICES.map((p) => {
    const count = countByPractice[p.key] ?? 0;
    const points = count * p.points;
    return {
      practiceId: p.key,
      label: p.label,
      maxPerDay: p.maxPerDay,
      pointsPer: p.points,
      count,
      points,
    };
  });

  const totalCount = perPractice.reduce((acc, p) => acc + p.count, 0);
  const totalPoints = perPractice.reduce((acc, p) => acc + p.points, 0);

  const activeDays = days.length; // days with at least 1 completion row

  return NextResponse.json(
    {
      range,
      asOfDayKey,
      startDayKey,
      endDayKey,
      totals: { totalCount, totalPoints, activeDays },
      perPractice,
    },
    { status: 200 }
  );
}
