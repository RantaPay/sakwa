"use client";

import { Package } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { QueryGate } from "@/components/query-gate";
import { listWarehouses } from "./warehouses";
import { useStock } from "./use-stock";

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
            <div className="flex items-start justify-between gap-3">
              <p className="text-base text-muted">{nameOf(row.warehouse_id)}</p>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Package size={22} weight="light" aria-hidden />
              </span>
            </div>
            <p className="mt-2 font-mono text-3xl">{row.bags_on_hand} bags</p>
            <p className="text-base text-muted">{row.kg_on_hand} kg on hand</p>
            <p className="mt-3 text-sm text-muted">
              In {row.bags_in} · Out {row.bags_out}
            </p>
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
