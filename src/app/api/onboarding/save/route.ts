import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, validationError, internalError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  practiceIds: z.array(z.string()).min(1).max(10),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return validationError(z.treeifyError(parsed.error), "Invalid input");

  const practiceIds = parsed.data.practiceIds;

  // Validate practiceIds exist and are accessible (built-in or owned by user).
  const rows = await prisma.practice.findMany({
    where: {
      id: { in: practiceIds },
      archivedAt: null,
      OR: [{ ownerId: null }, { ownerId: user.id }],
    },
    select: { id: true },
  });
  const ok = new Set(rows.map((r) => r.id));
  const invalid = practiceIds.filter((id) => !ok.has(id));
  if (invalid.length) {
    return validationError({ practiceIds: [`Unknown practiceIds: ${invalid.join(", ")}`] }, "Invalid input");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.userPractice.deleteMany({ where: { userId: user.id } });
      await tx.userPractice.createMany({
        data: practiceIds.map((practiceId) => ({ userId: user.id, practiceId })),
        skipDuplicates: true,
      });
    });

    return NextResponse.json({ ok: true, practiceIds }, { status: 200 });
  } catch {
    return internalError();
  }
}