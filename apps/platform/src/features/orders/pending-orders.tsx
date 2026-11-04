"use client";

import { useQuery } from "@tanstack/react-query";
import { listAllOrders } from "./orders";
import { queryKeys } from "@/lib/query-keys";
import { useStoreScope, inScope } from "@/features/stock/use-store-scope";

export function PendingOrdersCard({ mode }: { mode: "admin" | "warehouse" }) {
  const orders = useQuery({ queryKey: queryKeys.orders(), queryFn: listAllOrders });
  const scope = useStoreScope();
  const rows = (orders.data ?? []).filter((row) => {
    if (mode === "admin") return row.status === "placed";
    return row.status === "approved" && inScope(scope.ids, row.warehouse_id);
  });

  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-5">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
        Pending orders
      </p>
      <p className="mt-2 font-mono text-4xl font-semibold">{rows.length}</p>
      <p className="mt-1 text-sm text-muted">
        {mode === "admin"
          ? "Waiting for approval."
          : "Waiting for this store to release."}
      </p>
    </section>
  );
}
