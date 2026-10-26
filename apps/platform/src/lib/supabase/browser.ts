"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@sakwa/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/demo/accounts";
import { createDemoClient } from "@/lib/demo/client";
import { readDemoSessionFromDocument } from "@/lib/demo/read-session";

export function createBrowserSupabase(): SupabaseClient<Database> {
  if (isDemoMode()) {
    return createDemoClient(readDemoSessionFromDocument()) as unknown as SupabaseClient<Database>;
  }
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
