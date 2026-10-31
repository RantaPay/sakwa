"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { listStock, listWarehouses } from "@/features/stock";
import { queryKeys } from "@/lib/query-keys";

export default function DirectorStoresPage() {
  const stock = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });
  const names = new Map((stores.data ?? []).map((row) => [row.id, row.name]));

  return (
    <div>
      <PageHeading mark="stores" title="Stores" body="Confirmed bags in, minus bags released." />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(stock.data ?? []).map((row) => (
          <li key={row.warehouse_id} className="p-4">
            <p className="text-sm text-muted">{names.get(row.warehouse_id) ?? "Store"}</p>
            <p className="font-mono text-2xl">{row.bags_on_hand} bags</p>
            <p className="text-sm text-muted">{row.kg_on_hand} kg on hand</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
