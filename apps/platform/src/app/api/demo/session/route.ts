import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_COOKIE, isDemoMode, parseDemoCookie } from "@/lib/demo/accounts";

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo is off." }, { status: 404 });
  }
  const cookieStore = await cookies();
  const account = parseDemoCookie(cookieStore.get(DEMO_COOKIE)?.value);
  if (!account) {
    return NextResponse.json({ account: null }, { status: 401 });
  }
  return NextResponse.json({ account });
}
