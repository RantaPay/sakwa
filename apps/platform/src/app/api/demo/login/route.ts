import { NextResponse } from "next/server";
import { DEMO_COOKIE, encodeDemoCookie, isDemoMode, matchDemoAccount } from "@/lib/demo/accounts";

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo is off." }, { status: 404 });
  }
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
  } | null;
  const account = matchDemoAccount(String(body?.email ?? ""), String(body?.password ?? ""));
  if (!account) {
    return NextResponse.json({ error: "Email or password is not right." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true, account });
  response.cookies.set({
    name: DEMO_COOKIE,
    value: encodeDemoCookie(account),
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
