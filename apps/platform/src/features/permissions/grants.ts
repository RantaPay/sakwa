"use client";

import { createBrowserSupabase } from "@/lib/supabase/browser";
import { encodeGrantCookie } from "./access";
import { PERMISSION_COOKIE, type PermissionRow } from "./catalog";

export async function listPermissionRows(): Promise<PermissionRow[]> {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("role_permissions").select("role, feature_id, enabled");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    role: row.role,
    feature_id: row.feature_id,
    enabled: row.enabled,
  }));
}

export async function savePermission(input: {
  role: string;
  featureId: string;
  enabled: boolean;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("role_permissions").upsert({
    id: `${input.role}:${input.featureId}`,
    role: input.role,
    feature_id: input.featureId,
    enabled: input.enabled,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export function writeGrantCookie(rows: PermissionRow[]) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(encodeGrantCookie(rows));
  document.cookie = `${PERMISSION_COOKIE}=${value}; path=/; samesite=lax; max-age=31536000`;
}
