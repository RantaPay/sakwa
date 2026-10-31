"use client";

import { ROLE_HOME, type Role } from "@sakwa/types";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { pathAccess } from "./access";
import { usePermissions } from "./provider";

export function PermissionGate({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { rows, ready } = usePermissions();
  const blocked = role !== "admin" && ready && pathAccess(pathname, role, rows) === "deny";

  useEffect(() => {
    if (blocked) router.replace(ROLE_HOME[role]);
  }, [blocked, role, router]);

  if (blocked) return null;
  return children;
}
