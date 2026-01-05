import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow, parseDayKey } from "@/lib/time";
import { prisma } from "@/lib/db";
import { unauthorized, validationError, invalidDayKey, internalError } from "@/lib/http/errors";

import { getStats } from "@/server/stats/getStats";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  range: z.enum(["today", "week", "month", "all"]).optional(),
  dayKey: z.string().optional(),
  days: z.coerce.number().int().min(7).max(365).optional(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    range: url.searchParams.get("range") ?? undefined,
    dayKey: url.searchParams.get("dayKey") ?? undefined,
    days: url.searchParams.get("days") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(z.treeifyError(parsed.error), "Invalid query");
  }

  const range = parsed.data.range ?? "week";
  const asOfDayKey = parsed.data.dayKey ?? dayKeyNow();
  const daysForAll = parsed.data.days ?? 90;

  try {
    parseDayKey(asOfDayKey);
  } catch {
    return invalidDayKey(asOfDayKey);
  }

  try {
    const result = await getStats(prisma, {
      userId: user.id,
      range,
      asOfDayKey,
      daysForAll,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error("STATS_ERROR:", e);
    return internalError();
  }
}
