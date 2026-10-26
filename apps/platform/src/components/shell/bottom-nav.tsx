"use client";

import type { Role } from "@sakwa/types";
import { cn } from "@sakwa/ui/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLE_NAV } from "./nav-config";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ROLE_NAV[role].slice(0, 4);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-white lg:hidden">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== `/${role}` && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-14 items-center justify-center px-1 text-center text-[11px] font-medium",
              active ? "text-primary" : "text-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
