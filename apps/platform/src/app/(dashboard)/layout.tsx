import { isRole, type Role } from "@sakwa/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/shell/bottom-nav";
import { DashboardFrame } from "@/components/shell/dashboard-frame";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { actingRole } from "@/features/permissions/access";
import { PermissionGate } from "@/features/permissions/gate";
import { loadGrants } from "@/features/permissions/load-grants";
import { PermissionProvider } from "@/features/permissions/provider";
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
  const active = actingRole(path, held);
  if (!active) redirect("/login");
  const grants = await loadGrants();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return (
    <PermissionProvider initial={grants}>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar role={active} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar roles={held} activeRole={active} unread={count ?? 0} />
          <PermissionGate role={active}>
            <DashboardFrame role={active}>{children}</DashboardFrame>
          </PermissionGate>
        </div>
        <BottomNav role={active} />
      </div>
    </PermissionProvider>
  );
}
