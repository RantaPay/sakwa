import { enquirySchema } from "@sakwa/validators";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { EnquiryReceivedEmail } from "@sakwa/emails";
import { createAdminSupabase } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 4;

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = await hashIp(ip);
  const admin = createAdminSupabase();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await admin
    .from("enquiry_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((count ?? 0) >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { error: "Please wait a few minutes before sending another message." },
      { status: 429 },
    );
  }

  await admin.from("enquiry_rate_limits").insert({ ip_hash: ipHash });

  const { error } = await admin.from("investor_enquiries").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    intended_amount_naira: parsed.data.intendedAmountNaira || null,
    message: parsed.data.message,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save the enquiry." }, { status: 500 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.DIRECTOR_ALERT_EMAIL;
  if (key && to) {
    const resend = new Resend(key);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Sakwa Agro Enterprise <records@sakwaagro.com>",
      to: [to],
      subject: `Enquiry from ${parsed.data.name}`,
      react: EnquiryReceivedEmail({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        intendedAmountNaira: parsed.data.intendedAmountNaira,
        message: parsed.data.message,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
