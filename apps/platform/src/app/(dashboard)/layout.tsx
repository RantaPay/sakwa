import { isRole, type Role } from "@sakwa/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/shell/bottom-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const held = (roles ?? [])
    .map((row) => row.role)
    .filter((role): role is Role => isRole(role));

  const headerList = await headers();
  const path = headerList.get("x-pathname") ?? "";
  const fromPath = held.find((role) => path.includes(`/${role}`));
  const active = fromPath ?? held[0];
  if (!active) redirect("/login");

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar role={active} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar roles={held} activeRole={active} unread={count ?? 0} />
        <div className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</div>
      </div>
      <BottomNav role={active} />
    </div>
  );
}
