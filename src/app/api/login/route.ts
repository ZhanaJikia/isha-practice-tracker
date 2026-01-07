import { NextResponse } from "next/server";
import { z } from "zod";

import { setSessionCookie } from "@/lib/cookies";
import { validationError, invalidCredentials, internalError } from "@/lib/http/errors";
import { login } from "@/server/auth/login";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(z.treeifyError(parsed.error), "Invalid input");
  }

  try {
    const result = await login(parsed.data);

    if (result.kind === "invalid_credentials") return invalidCredentials();

    await setSessionCookie(result.token, result.expiresAt);
    return NextResponse.json({ user: result.user }, { status: 200 });
  } catch (e) {
    console.error("LOGIN_ERROR:", e);
    return internalError();
  }
}

