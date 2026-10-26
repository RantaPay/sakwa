"use client";

import { ROLE_LABEL, type Role } from "@sakwa/types";
import { cn } from "@sakwa/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { ROLE_NAV } from "./nav-config";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ROLE_NAV[role];
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);

  function nav() {
    return (
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== `/${role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center rounded-full px-3 text-sm font-medium",
                active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-border bg-stone-50 lg:flex lg:flex-col">
        <div className="flex h-16 items-center px-5 text-sm font-semibold tracking-tight">
          Sakwa Agro Enterprise
        </div>
        <p className="px-5 pb-3 text-xs uppercase tracking-[0.14em] text-muted">
          {ROLE_LABEL[role]}
        </p>
        {nav()}
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-white pt-4">
            <p className="px-5 pb-3 text-xs uppercase tracking-[0.14em] text-muted">
              {ROLE_LABEL[role]}
            </p>
            {nav()}
          </aside>
        </div>
      ) : null}
    </>
  );
}
