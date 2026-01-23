import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, validationError, internalError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  points: z.number().int().min(1).max(50).optional(),
  maxPerDay: z.number().int().min(1).max(50).optional(),
  description: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return validationError(z.treeifyError(parsed.error), "Invalid input");

  const id = crypto.randomUUID();
  const { name, description } = parsed.data;
  const points = parsed.data.points ?? 1;
  const maxPerDay = parsed.data.maxPerDay ?? 1;

  try {
    const practice = await prisma.$transaction(async (tx) => {
      const practice = await tx.practice.create({
        data: {
          id,
          name,
          description: description || null,
          isCustom: true,
          ownerId: user.id,
          points,
          maxPerDay,
        },
        select: {
          id: true,
          name: true,
          description: true,
          isCustom: true,
          points: true,
          maxPerDay: true,
        },
      });

      // Auto-select newly created custom practice for this user.
      await tx.userPractice.create({
        data: { userId: user.id, practiceId: practice.id },
      });

      return practice;
    });

    return NextResponse.json({ practice }, { status: 201 });
  } catch (e) {
    console.error("PRACTICE_CUSTOM_CREATE_ERROR:", e);
    return internalError();
  }
}

