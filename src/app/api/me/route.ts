import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { unauthorized } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return NextResponse.json({ user }, { status: 200 });
}
