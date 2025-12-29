import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME ?? "isha_session";

export function setSessionCookie(
  res: NextResponse,
  sessionId: string,
  expiresAt: Date
) {
  res.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
