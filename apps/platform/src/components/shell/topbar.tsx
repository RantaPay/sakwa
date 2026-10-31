"use client";

import { Bell, List } from "@phosphor-icons/react";
import { ROLE_HOME, ROLE_LABEL, type Role } from "@sakwa/types";
import { Button } from "@sakwa/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { useUiStore } from "@/lib/ui-store";

export function Topbar({
  roles,
  activeRole,
  unread,
}: {
  roles: Role[];
  activeRole: Role;
  unread: number;
}) {
  const router = useRouter();
  const pending = useUiStore((s) => s.pendingCount);
  const online = useUiStore((s) => s.online);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="z-20 flex h-[4.5rem] shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/90 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-12 items-center justify-center lg:hidden"
          aria-label="Open menu"
          onClick={() => useUiStore.getState().setSidebarOpen(true)}
        >
          <List size={26} />
        </button>
        <span
          className={`size-2 rounded-full ${online ? "bg-primary" : "bg-warning"}`}
          title={online ? "Online" : "Offline"}
        />
        {pending > 0 ? (
          <span className="text-sm text-warning">{pending} waiting to send</span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {roles.length > 1
          ? roles.map((role) => (
              <Link
                key={role}
                href={ROLE_HOME[role]}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${
                  role === activeRole
                    ? "bg-primary text-primary-foreground"
                    : "bg-wash text-muted"
                }`}
              >
                {ROLE_LABEL[role]}
              </Link>
            ))
          : null}
        <Link
          href={`/${activeRole}/notifications`}
          className="relative flex size-12 items-center justify-center"
          aria-label="Notices"
        >
          <Bell size={24} />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" />
          ) : null}
        </Link>
        <Button variant="ghost" size="sm" type="button" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
