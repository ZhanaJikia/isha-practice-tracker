import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie } from "@/lib/cookies";
import { validationError, internalError, usernameTaken } from "@/lib/http/errors";
import { register } from "@/server/auth/register";

export const dynamic = "force-dynamic";

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
    return validationError(z.treeifyError(parsed.error), "Invalid input");
  }

  const { username } = parsed.data;

  try {
    const result = await register(parsed.data);

    if (result.kind === "username_taken") return usernameTaken(username);

    await setSessionCookie(result.token, result.expiresAt);
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (e) {
    console.error("REGISTER_ERROR:", e);
    return internalError();
  }
}

