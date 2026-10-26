import type { Role } from "@sakwa/types";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listUsers() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, user_roles(role)")
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function listUsersByRole(role: Role) {
  const supabase = createBrowserSupabase();
  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", role);
  if (roleError) throw roleError;
  const ids = (roles ?? []).map((row) => row.user_id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active")
    .in("id", ids)
    .order("full_name");
  if (error) throw error;
  return data;
}

export async function getProfile(id: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(input: {
  id: string;
  fullName: string;
  phone: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, phone: input.phone })
    .eq("id", input.id);
  if (error) throw error;
}

export async function setUserActive(id: string, isActive: boolean) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}
