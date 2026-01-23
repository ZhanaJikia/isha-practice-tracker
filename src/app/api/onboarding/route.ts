import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, internalError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const rows = await prisma.userPractice.findMany({
      where: { userId: user.id },
      select: { practiceId: true },
      orderBy: { practiceId: "asc" },
    });

    const practiceIds = rows.map((r) => r.practiceId);
    return NextResponse.json({ practiceIds }, { status: 200 });
  } catch (e) {
    console.error("ONBOARDING_GET_ERROR:", e);
    return internalError();
  }
}