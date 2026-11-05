import { createServerSupabase } from "@/lib/supabase/server";
import type { PermissionRow } from "./catalog";

export async function loadGrants(): Promise<PermissionRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("role, feature_id, enabled");
  if (error || !data) return [];
  return data.map((row) => ({
    role: row.role,
    feature_id: row.feature_id,
    enabled: row.enabled,
  }));
}
