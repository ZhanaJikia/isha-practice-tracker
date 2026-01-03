import "server-only";
import { DateTime } from "luxon";

export const APP_TZ = process.env.APP_TZ ?? "Asia/Tbilisi";
const WEEK_LOCALE = "en-GB"; // Monday-first week
const DAY_KEY_FMT = "yyyy-LL-dd";

export function dayKeyNow(): string {
  return DateTime.now().setZone(APP_TZ).toFormat(DAY_KEY_FMT);
}

/** Convert a JS Date (instant) into a dayKey in APP_TZ */
export function dayKeyFromDate(date: Date): string {
  return DateTime.fromJSDate(date).setZone(APP_TZ).toFormat(DAY_KEY_FMT);
}

/** Parse a dayKey (YYYY-MM-DD) into a DateTime at start of day in APP_TZ. Throws on invalid input. */
export function parseDayKey(dayKey: string): DateTime {
  const dt = DateTime.fromFormat(dayKey, DAY_KEY_FMT, { zone: APP_TZ })
    .setLocale(WEEK_LOCALE)
    .startOf("day");

  if (!dt.isValid) {
    throw new Error(`Invalid dayKey "${dayKey}": ${dt.invalidReason ?? "unknown reason"}`);
  }

  return dt;
}

export function weekStartDayKey(dayKey: string): string {
  return parseDayKey(dayKey).startOf("week").toFormat(DAY_KEY_FMT);
}

/** Returns dayKey of the 1st day of month for the given dayKey. */
export function monthStartDayKey(dayKey: string): string {
  return parseDayKey(dayKey).startOf("month").toFormat(DAY_KEY_FMT);
}
