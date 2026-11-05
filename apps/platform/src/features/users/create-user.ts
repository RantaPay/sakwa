"use server";

import { ROLES, isRole, type Role } from "@sakwa/types";
import { z } from "zod";
import { createPersonAccount } from "@/features/accounts/accounts";
import { createServerSupabase } from "@/lib/supabase/server";

export type CreateUserResult = { ok: true; email: string } | { ok: false; error: string };

const personSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the name.").max(120),
  email: z.email("Enter a valid email.").transform((value) => value.trim().toLowerCase()),
  phone: z.string().trim().min(7, "Enter the phone number.").max(20),
  password: z.string().min(8, "Use at least 8 characters for the password.").max(72),
  primaryRole: z.enum(ROLES as unknown as [Role, ...Role[]], "Choose a primary role."),
  roles: z.array(z.string()).default([]),
});

async function callerIsAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("is_active").eq("id", user.id).maybeSingle(),
  ]);
  if (profile?.is_active === false) return false;
  return (roles ?? []).some((row) => row.role === "admin");
}

export async function createUserAction(input: {
  fullName: string;
  email: string;
  phone: string;
  roles: Role[];
  primaryRole: Role;
  password: string;
}): Promise<CreateUserResult> {
  try {
    if (!(await callerIsAdmin())) {
      return { ok: false, error: "Only an admin can create people." };
    }
    const parsed = personSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Check the details.",
      };
    }
    const data = parsed.data;
    const roles = [...new Set([data.primaryRole, ...data.roles.filter(isRole)])];
    await createPersonAccount({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.primaryRole,
      roles,
    });
    return { ok: true, email: data.email };
  } catch (error) {
    console.error("createUserAction failed", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create the person.",
    };
  }
}
