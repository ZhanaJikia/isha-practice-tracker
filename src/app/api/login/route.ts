import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/cookies";

const LoginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, passwordHash: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);

    return NextResponse.json(
      { user: { id: user.id, username: user.username, createdAt: user.createdAt } },
      { status: 200 }
    );
  } catch (e) {
    console.error("LOGIN_ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
