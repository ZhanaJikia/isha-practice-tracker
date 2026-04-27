import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized, internalError } from "@/lib/http/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const practices = await prisma.practice.findMany({
      where: {
        archivedAt: null,
        OR: [{ ownerId: null }, { ownerId: user.id }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        isCustom: true,
        points: true,
        maxPerDay: true,
      },
      orderBy: [{ isCustom: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ practices }, { status: 200 });
  } catch (e) {
    console.error("PRACTICES_ERROR:", e);
    return internalError();
  }
}
