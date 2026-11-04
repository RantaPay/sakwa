import { ROLE_HOME, isRole } from "@sakwa/types";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const login = NextResponse.redirect(new URL("/login", request.url));
  if (!url || !anon || !service || !userId) return login;

  const cookieStore = await cookies();
  let response = NextResponse.redirect(new URL("/admin/accounts", request.url));
  const session = createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        for (const { name, value, options } of items)
          response.cookies.set(name, value, options);
      },
    },
  });

  const { data: auth } = await session.auth.getUser();
  if (!auth.user) return login;
  const { data: held } = await session
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id);
  if (!held?.some((row) => row.role === "admin")) return login;

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile } = await admin
    .from("profiles")
    .select("email, primary_role, is_active")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.email || profile.is_active === false) return response;

  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
  });
  const token = link.data.properties?.hashed_token;
  if (link.error || !token) return response;

  const home = isRole(profile.primary_role) ? ROLE_HOME[profile.primary_role] : "/";
  response = NextResponse.redirect(new URL(home, request.url));
  const entering = createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        for (const { name, value, options } of items)
          response.cookies.set(name, value, options);
      },
    },
  });
  const signed = await entering.auth.verifyOtp({ type: "magiclink", token_hash: token });
  if (signed.error) return NextResponse.redirect(new URL("/admin/accounts", request.url));
  return response;
}
