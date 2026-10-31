"use client";

import { ROLE_LABEL, type Role } from "@sakwa/types";
import { cn } from "@sakwa/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive } from "@/features/permissions/access";
import { useRoleNav } from "@/features/permissions/provider";
import { useUiStore } from "@/lib/ui-store";
import { Mark } from "@/components/mark";
import { iconForHref } from "./section-icons";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = useRoleNav(role);
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);

  function nav() {
    return (
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href, role);
          const Icon = iconForHref(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-full px-3.5 text-base font-medium",
                active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-white",
              )}
            >
              <Icon
                size={24}
                weight="light"
                aria-hidden
                className={cn("shrink-0", active ? "text-primary-foreground" : "text-primary")}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      <aside className="hidden h-full w-72 shrink-0 overflow-y-auto border-r border-border bg-surface lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-5 pb-3 pt-5">
          <Mark className="h-12 w-auto shrink-0" />
          <p className="text-base font-semibold leading-tight tracking-tight">
            Sakwa
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Agro Enterprise
            </span>
          </p>
        </div>
        <p className="px-5 pb-3 text-sm uppercase tracking-[0.14em] text-muted">
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
          <aside className="relative z-10 flex h-full w-72 flex-col bg-surface pt-4">
            <div className="flex items-center gap-3 px-5 pb-4">
              <Mark className="h-12 w-auto shrink-0" />
              <p className="text-base font-semibold leading-tight tracking-tight">
                Sakwa
                <span className="block text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Agro Enterprise
                </span>
              </p>
            </div>
            <p className="px-5 pb-3 text-sm uppercase tracking-[0.14em] text-muted">
              {ROLE_LABEL[role]}
            </p>
            {nav()}
          </aside>
        </div>
      ) : null}
    </>
  );
}
