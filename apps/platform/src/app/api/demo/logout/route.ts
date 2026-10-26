import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/accounts";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: DEMO_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}
