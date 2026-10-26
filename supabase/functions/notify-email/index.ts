import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const secret = Deno.env.get("NOTIFY_SECRET");
  const header = req.headers.get("x-sakwa-secret");
  if (!secret || header !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await req.json()) as {
    to: string[];
    subject: string;
    html: string;
  };

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL") ?? "Sakwa Agro Enterprise <records@sakwaagro.com>";
  if (!resendKey) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    return new Response(await res.text(), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
