import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { unauthorized, validationError, maxPerDayReached, internalError } from "@/lib/http/errors";
import { logError } from "@/lib/log";
import { done } from "@/server/tracker/done";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  practiceId: z.string(),
  delta: z.number().int().min(1).max(50).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return validationError(z.treeifyError(parsed.error));

  try {
    const result = await done({ userId: user.id, ...parsed.data });

    if (result.kind === "invalid_practice") {
      return validationError({ practiceId: ["Unknown practiceId"] });
    }

    if (result.kind === "max_reached") {
      return maxPerDayReached({
        practiceId: result.practiceId,
        dayKey: result.dayKey,
        maxPerDay: result.maxPerDay,
        count: result.count,
      });
    }

    return NextResponse.json(
      {
        completion: result.completion,
        dayKey: result.dayKey,
        practiceId: result.practiceId,
        maxPerDay: result.maxPerDay,
      },
      { status: 200 }
    );
  } catch (e) {
    logError("api/done", e, { userId: user.id });
    return internalError();
  }
}

