"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useAuthUser } from "@/lib/use-auth-user";
import { listAssignedWarehouseIds } from "./warehouses";

/** A store login only sees the warehouses assigned to that person. */
export function useStoreScope() {
  const pathname = usePathname();
  const limited = pathname.startsWith("/warehouse");
  const { data: user } = useAuthUser();
  const assigned = useQuery({
    queryKey: ["warehouse-scope", user?.id],
    enabled: limited && Boolean(user?.id),
    queryFn: () => listAssignedWarehouseIds(user?.id as string),
  });
  return {
    limited,
    ready: !limited || assigned.isFetched,
    ids: limited ? (assigned.data ?? []) : null,
  };
}

export function inScope(ids: string[] | null, warehouseId: string | null) {
  if (!ids) return true;
  if (!warehouseId) return false;
  return ids.includes(warehouseId);
}
