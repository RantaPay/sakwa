import type { Role } from "@sakwa/types";
import { createId } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listUsers() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
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

function blank(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function updateProfile(input: {
  id: string;
  fullName: string;
  phone: string;
  area: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  shopName: string;
  address: string;
  avatarUrl: string | null;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      area: blank(input.area),
      bank_name: blank(input.bankName),
      account_name: blank(input.accountName),
      account_number: blank(input.accountNumber),
      shop_name: blank(input.shopName),
      address: blank(input.address),
      avatar_url: input.avatarUrl,
    })
    .eq("id", input.id);
  if (error) throw error;
}

export async function setUserActive(id: string, isActive: boolean) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function createPersonLocal(input: {
  fullName: string;
  email: string;
  phone: string;
  roles: Role[];
  primaryRole: Role;
}) {
  const supabase = createBrowserSupabase();
  const id = createId();
  const { error: profileError } = await supabase.from("profiles").insert({
    id,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    primary_role: input.primaryRole,
    is_active: true,
  });
  if (profileError) throw profileError;
  const { error: roleError } = await supabase.from("user_roles").insert(
    input.roles.map((role) => ({ user_id: id, role })),
  );
  if (roleError) throw roleError;
}
