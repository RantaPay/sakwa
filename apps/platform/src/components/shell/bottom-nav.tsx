"use client";

import type { Role } from "@sakwa/types";
import { cn } from "@sakwa/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive } from "@/features/permissions/access";
import { useRoleNav } from "@/features/permissions/provider";
import { iconForHref } from "./section-icons";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = useRoleNav(role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-border bg-surface lg:hidden">
      {items.map((item) => {
        const active = isNavActive(pathname, item.href, role);
        const Icon = iconForHref(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[5rem] min-w-[5.25rem] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center"
          >
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-full",
                active ? "bg-primary-soft text-primary" : "text-muted",
              )}
            >
              <Icon size={22} weight="light" aria-hidden />
            </span>
            <span
              className={cn(
                "line-clamp-2 text-xs font-medium leading-tight",
                active ? "text-primary" : "text-muted",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
