import { ROLE_HOME, isRole, type Role } from "@sakwa/types";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("primary_role")
    .eq("id", user.id)
    .maybeSingle();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const held = (roles ?? [])
    .map((row) => row.role)
    .filter((role): role is Role => isRole(role));

  const primary = profile?.primary_role;
  const start = (primary && isRole(primary) && held.includes(primary)
    ? primary
    : held[0]) as Role | undefined;

  redirect(start ? ROLE_HOME[start] : "/login");
}
