import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  dayKeyNow,
  parseDayKey,
  weekStartDayKey,
  monthStartDayKey,
} from "@/lib/time";
import {
  PRACTICES,
  PRACTICE_BY_KEY,
  isPracticeKey,
} from "@/config/practices";

const QuerySchema = z.object({
  range: z.enum(["today", "week", "month", "all"]).optional(),
  dayKey: z.string().optional(), // anchor day
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

  // validate anchor dayKey strictly
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
    // "all" -> unbounded
    startDayKey = null;
    endDayKey = null;
  }

  const whereRange =
    startDayKey && endDayKey
      ? { dayKey: { gte: startDayKey, lte: endDayKey } }
      : {};

  try {
    // 1) counts per practice (sum of count)
    const groupedByPractice = await prisma.dailyPracticeCompletion.groupBy({
      by: ["practiceId"],
      where: { userId: user.id, ...whereRange },
      _sum: { count: true },
    });

    const countByPractice: Record<string, number> = {};
    for (const g of groupedByPractice) {
      if (!isPracticeKey(g.practiceId)) continue;
      countByPractice[g.practiceId] = g._sum.count ?? 0;
    }

    // 2) per-practice breakdown, ordered by PRACTICES config
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

    // 3) active days (distinct dayKeys with any completion rows in range)
    const groupedDays = await prisma.dailyPracticeCompletion.groupBy({
      by: ["dayKey"],
      where: { userId: user.id, ...whereRange },
      _sum: { count: true },
    });
    const activeDays = groupedDays.length;

    // 4) daily series for charts (only when range is bounded)
    // For "all" this could be huge, so we return [].
    let dailySeries: Array<{ dayKey: string; totalCount: number; totalPoints: number }> = [];

    if (range !== "all") {
      const groupedDaily = await prisma.dailyPracticeCompletion.groupBy({
        by: ["dayKey", "practiceId"],
        where: { userId: user.id, ...whereRange },
        _sum: { count: true },
      });

      const byDay: Record<
        string,
        { dayKey: string; totalCount: number; totalPoints: number }
      > = {};

      for (const row of groupedDaily) {
        if (!isPracticeKey(row.practiceId)) continue;
        const c = row._sum.count ?? 0;
        const pts = c * PRACTICE_BY_KEY[row.practiceId].points;

        const slot =
          byDay[row.dayKey] ??= { dayKey: row.dayKey, totalCount: 0, totalPoints: 0 };
        slot.totalCount += c;
        slot.totalPoints += pts;
      }

      dailySeries = Object.values(byDay).sort((a, b) => a.dayKey.localeCompare(b.dayKey));
    }

    return NextResponse.json(
      {
        range,
        asOfDayKey,
        startDayKey,
        endDayKey,
        totals: { totalCount, totalPoints, activeDays },
        perPractice,
        dailySeries,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("STATS_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
