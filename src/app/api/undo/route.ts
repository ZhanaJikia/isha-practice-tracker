import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { dayKeyNow } from "@/lib/time";
import { isPracticeKey } from "@/config/practices";

import { unauthorized, validationError, internalError } from "@/lib/http/errors";
import { undoCompletion } from "@/server/completions/undoCompletion";

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

  if (!parsed.success) {
    return validationError(z.treeifyError(parsed.error), "Invalid input");
  }

  const { practiceId } = parsed.data;
  const delta = parsed.data.delta ?? 1;

  if (!isPracticeKey(practiceId)) {
    return validationError({ practiceId: ["Unknown practiceId"] }, "Invalid input");
  }

  const dayKey = dayKeyNow();

  try {
    const result = await prisma.$transaction((tx) =>
      undoCompletion(tx, {
        userId: user.id,
        practiceId,
        dayKey,
        delta,
      })
    );

    return NextResponse.json({ ok: true, result, dayKey, practiceId }, { status: 200 });
  } catch (e) {
    console.error("UNDO_ERROR:", e);
    return internalError();
  }
}
