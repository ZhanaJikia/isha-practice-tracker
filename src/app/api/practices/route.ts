import { NextResponse } from "next/server";
import { PRACTICE_BY_KEY } from "@/config/practices";

export async function GET() {
  // return as a plain object (or transform to array if you prefer)
  return NextResponse.json({ practices: PRACTICE_BY_KEY }, { status: 200 });
}
