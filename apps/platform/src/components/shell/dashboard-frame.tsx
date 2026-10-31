"use client";

import type { Role } from "@sakwa/types";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function DashboardFrame({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === `/${role}`;

  if (isHome) {
    return <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-28 lg:px-8 lg:pb-8">{children}</div>
  );
}
