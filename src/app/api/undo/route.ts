import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { unauthorized, validationError, internalError } from "@/lib/http/errors";
import { undo } from "@/server/tracker/undo";

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
  if (!parsed.success) return validationError(z.treeifyError(parsed.error), "Invalid input");

  try {
    const result = await undo({ userId: user.id, ...parsed.data });

    if (result.kind === "invalid_practice") {
      return validationError({ practiceId: ["Unknown practiceId"] }, "Invalid input");
    }

    return NextResponse.json(
      { ok: true, result: result.result, dayKey: result.dayKey, practiceId: result.practiceId },
      { status: 200 }
    );
  } catch (e) {
    console.error("UNDO_ERROR:", e);
    return internalError();
  }
}

