"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@sakwa/types";
import { isDemoMode, readDemoSessionFromDocument } from "@/lib/demo/accounts";
import { createDemoClient } from "@/lib/demo/client";

function realBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function createBrowserSupabase() {
  if (isDemoMode()) {
    return createDemoClient(readDemoSessionFromDocument()) as unknown as ReturnType<
      typeof realBrowserClient
    >;
  }
  return realBrowserClient();
}
