"use server";

import type { Role } from "@sakwa/types";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function createUserAction(input: {
  fullName: string;
  email: string;
  phone: string;
  roles: Role[];
  primaryRole: Role;
  password: string;
}) {
  const admin = createAdminSupabase();
  const created = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    throw new Error(created.error?.message ?? "Could not create the person.");
  }
  const id = created.data.user.id;
  const { error: profileError } = await admin.from("profiles").insert({
    id,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    primary_role: input.primaryRole,
  });
  if (profileError) throw profileError;
  const { error: roleError } = await admin.from("user_roles").insert(
    input.roles.map((role) => ({ user_id: id, role })),
  );
  if (roleError) throw roleError;
}
