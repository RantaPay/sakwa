"use client";

import { useQuery } from "@tanstack/react-query";
import { QueryGate } from "@/components/query-gate";
import { listWarehouses } from "@/features/warehouses";
import { useStock } from "../hooks/use-stock";

export function StockBoard() {
  const { data, isLoading, isError } = useStock();
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });

  function nameOf(id: string) {
    return warehouses.data?.find((row) => row.id === id)?.name ?? "Store";
  }

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No stock yet"
      emptyBody="Confirmed incoming bags will appear here."
    >
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {(data ?? []).map((row) => (
          <li key={row.warehouse_id} className="rounded-lg border border-border p-5">
            <p className="text-sm text-muted">{nameOf(row.warehouse_id)}</p>
            <p className="mt-2 font-mono text-2xl">{row.bags_on_hand} bags</p>
            <p className="text-sm text-muted">{row.kg_on_hand} kg on hand</p>
            <p className="mt-3 text-xs text-muted">
              In {row.bags_in} · Out {row.bags_out}
            </p>
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
