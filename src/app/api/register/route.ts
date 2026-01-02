import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createSession, hashPassword, isUniqueConstraintError } from "@/lib/auth";
import { setSessionCookie } from "@/lib/cookies";

const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters/numbers/_ only"),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { username, passwordHash },
      select: { id: true, username: true, createdAt: true },
    });

    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("REGISTER_ERROR:", e);

    if (isUniqueConstraintError(e)) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const debug =
      process.env.NODE_ENV !== "production"
        ? e instanceof Error
          ? { message: e.message, stack: e.stack }
          : { message: String(e) }
        : undefined;

    return NextResponse.json({ error: "Server error", debug }, { status: 500 });
  }
}
