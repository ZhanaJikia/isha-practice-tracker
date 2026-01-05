import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow } from "@/lib/time";
import { PRACTICE_BY_KEY, isPracticeKey } from "@/config/practices";

import {
  unauthorized,
  validationError,
  maxPerDayReached,
  internalError,
} from "@/lib/http/errors";

import { applyCompletion } from "@/server/tracker/applyCompletion";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  practiceId: z.string(),
  delta: z.number().int().min(1).max(50).optional(), // default handled below
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return validationError(z.treeifyError(parsed.error));
  }

  const { practiceId } = parsed.data;
  const delta = parsed.data.delta ?? 1;

  // ✅ this is the narrowing point TypeScript actually understands
  if (!isPracticeKey(practiceId)) {
    return validationError({ practiceId: ["Unknown practiceId"] });
  }

  const maxPerDay = PRACTICE_BY_KEY[practiceId].maxPerDay;
  const dayKey = dayKeyNow();
  const now = new Date();

  try {
    const result = await prisma.$transaction((tx) =>
      applyCompletion(tx, {
        userId: user.id,
        practiceId,
        dayKey,
        delta,
        maxPerDay,
        now,
      })
    );

    if (result.kind === "max_reached") {
      return maxPerDayReached({
        practiceId,
        dayKey,
        maxPerDay: result.maxPerDay,
        count: result.count,
      });
    }

    return NextResponse.json(
      { completion: result.row, dayKey, practiceId, maxPerDay },
      { status: 200 }
    );
  } catch (e) {
    console.error("DONE_ERROR:", e);
    return internalError();
  }
}
