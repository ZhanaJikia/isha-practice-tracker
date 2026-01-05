import { NextResponse } from "next/server";
import { PRACTICES } from "@/config/practices";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ practices: PRACTICES }, { status: 200 });
}
