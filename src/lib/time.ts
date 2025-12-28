import { DateTime } from "luxon";

export const APP_TZ = process.env.APP_TZ ?? "Asia/Tbilisi";
const WEEK_LOCALE = "en-GB"; // Monday-first week

export function dayKeyNow(): string {
  return DateTime.now().setZone(APP_TZ).toFormat("yyyy-LL-dd");
}

/** Convert a JS Date (UTC) into a dayKey in APP_TZ */
export function dayKeyFromDate(date: Date): string {
  return DateTime.fromJSDate(date).setZone(APP_TZ).toFormat("yyyy-LL-dd");
}


export function parseDayKey(dayKey: string): DateTime {
  return DateTime.fromFormat(dayKey, "yyyy-LL-dd", {
    zone: APP_TZ,
    locale: WEEK_LOCALE,
  }).startOf("day");
}

export function weekStartDayKey(dayKey: string): string {
  return parseDayKey(dayKey).startOf("week").toFormat("yyyy-LL-dd");
}

/** Returns dayKey of the 1st day of month for the given dayKey. */
export function monthStartDayKey(dayKey: string): string {
  return parseDayKey(dayKey).startOf("month").toFormat("yyyy-LL-dd");
}
