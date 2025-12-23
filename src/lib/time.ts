import { DateTime } from "luxon";

export const APP_TZ = process.env.APP_TZ ?? "Asia/Tbilisi";

/** Returns "YYYY-MM-DD" in APP_TZ (this is what you store in DB as dayKey) */
export function dayKeyNow(): string {
  return DateTime.now().setZone(APP_TZ).toFormat("yyyy-LL-dd");
}

/** Convert a JS Date (UTC) into a dayKey in APP_TZ */
export function dayKeyFromDate(date: Date): string {
  return DateTime.fromJSDate(date).setZone(APP_TZ).toFormat("yyyy-LL-dd");
}

/** Parse an existing dayKey string into a DateTime in APP_TZ */
export function parseDayKey(dayKey: string): DateTime {
  return DateTime.fromFormat(dayKey, "yyyy-LL-dd", { zone: APP_TZ }).startOf("day");
}

/** Monday start (ISO week). Returns dayKey of the Monday for the given dayKey. */
export function weekStartDayKey(dayKey: string): string {
  const dt = parseDayKey(dayKey);
  const monday = dt.minus({ days: dt.weekday - 1 });
  return monday.toFormat("yyyy-LL-dd");
}

/** Returns dayKey of the 1st day of month for the given dayKey. */
export function monthStartDayKey(dayKey: string): string {
  return parseDayKey(dayKey).startOf("month").toFormat("yyyy-LL-dd");
}
