import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@sakwa/types";
import { DEMO_COOKIE, isDemoMode, parseDemoCookie } from "@/lib/demo/accounts";
import { createDemoClient } from "@/lib/demo/client";

async function realServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}

export async function createServerSupabase() {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    return createDemoClient(parseDemoCookie(cookieStore.get(DEMO_COOKIE)?.value)) as unknown as Awaited<
      ReturnType<typeof realServerClient>
    >;
  }
  return realServerClient();
}
