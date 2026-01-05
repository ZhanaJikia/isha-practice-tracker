import { parseDayKey, weekStartDayKey, monthStartDayKey } from "@/lib/time";
import type { StatsRange } from "./types";

const DAY_FMT = "yyyy-LL-dd";

export function totalsBounds(range: StatsRange, asOfDayKey: string) {
  switch (range) {
    case "today":
      return { startDayKey: asOfDayKey, endDayKey: asOfDayKey };
    case "week":
      return { startDayKey: weekStartDayKey(asOfDayKey), endDayKey: asOfDayKey };
    case "month":
      return { startDayKey: monthStartDayKey(asOfDayKey), endDayKey: asOfDayKey };
    case "all":
      return { startDayKey: null, endDayKey: null };
  }
}

export function whereForBounds(bounds: { startDayKey: string | null; endDayKey: string | null }) {
  if (!bounds.startDayKey || !bounds.endDayKey) return {};
  return { dayKey: { gte: bounds.startDayKey, lte: bounds.endDayKey } };
}

export function chartWindowForAll(asOfDayKey: string, days: number) {
  const start = parseDayKey(asOfDayKey).minus({ days: days - 1 }).toFormat(DAY_FMT);
  return { days, startDayKey: start, endDayKey: asOfDayKey };
}
