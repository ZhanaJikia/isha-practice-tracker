import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, clearSessionCookie } from "@/lib/cookies";
import { internalError } from "@/lib/http/errors";
import { logout } from "@/server/auth/logout";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  try {
    await logout({ token });
  } catch (e) {
    console.error("LOGOUT_ERROR:", e);
    await clearSessionCookie();
    return internalError();
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}



