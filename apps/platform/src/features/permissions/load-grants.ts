import { cookies } from "next/headers";
import { isDemoMode } from "@/lib/demo/accounts";
import { createServerSupabase } from "@/lib/supabase/server";
import { decodeGrantCookie } from "./access";
import { PERMISSION_COOKIE, type PermissionRow } from "./catalog";

export async function loadGrants(): Promise<PermissionRow[]> {
  if (isDemoMode()) {
    const cookieStore = await cookies();
    return decodeGrantCookie(cookieStore.get(PERMISSION_COOKIE)?.value);
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("role_permissions").select("role, feature_id, enabled");
  if (error || !data) return [];
  return data.map((row) => ({
    role: row.role,
    feature_id: row.feature_id,
    enabled: row.enabled,
  }));
}
