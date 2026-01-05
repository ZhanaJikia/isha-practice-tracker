import { parseDayKey } from "@/lib/time";
import type { Db, StatsRange, StatsResponse } from "./types";
import { totalsBounds, whereForBounds, chartWindowForAll } from "./bounds";
import { fetchCountByPractice, fetchActiveDays, fetchDailyPracticeSums } from "./repo";
import { buildPerPractice, buildDailySeries } from "./build";

export async function getStats(
  db: Db,
  params: { userId: string; range: StatsRange; asOfDayKey: string; daysForAll?: number }
): Promise<StatsResponse> {
  const { userId, range, asOfDayKey } = params;

  // route already validates; this is just a safety assert
  parseDayKey(asOfDayKey);

  const bounds = totalsBounds(range, asOfDayKey);
  const whereTotals = whereForBounds(bounds);

  const chartWindow =
    range === "all" ? chartWindowForAll(asOfDayKey, params.daysForAll ?? 90) : null;

  const whereCharts =
    range === "all" && chartWindow
      ? { dayKey: { gte: chartWindow.startDayKey, lte: chartWindow.endDayKey } }
      : whereTotals;

  const countByPracticeRaw = await fetchCountByPractice(db, userId, whereTotals);
  const perPractice = buildPerPractice(countByPracticeRaw);

  const totalCount = perPractice.reduce((a, p) => a + p.count, 0);
  const totalPoints = perPractice.reduce((a, p) => a + p.points, 0);

  const activeDays = await fetchActiveDays(db, userId, whereTotals);
  const dailyRows = await fetchDailyPracticeSums(db, userId, whereCharts);
  const dailySeries = buildDailySeries(dailyRows);

  return {
    range,
    asOfDayKey,
    startDayKey: bounds.startDayKey,
    endDayKey: bounds.endDayKey,
    totals: { totalCount, totalPoints, activeDays },
    perPractice,
    dailySeries,
    chartWindow,
  };
}
