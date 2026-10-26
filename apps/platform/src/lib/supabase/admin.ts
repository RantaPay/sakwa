import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@sakwa/types";
import { isDemoMode } from "@/lib/demo/accounts";
import { createDemoClient } from "@/lib/demo/client";

export function createAdminSupabase(): SupabaseClient<Database> {
  if (isDemoMode()) {
    return createDemoClient(null) as unknown as SupabaseClient<Database>;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Service role key is not configured.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
