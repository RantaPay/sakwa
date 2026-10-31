"use client";

import { Button, ConfirmDialog, StatusBadge } from "@sakwa/ui";
import { formatNaira, orderLineKobo, pricePerKgKobo } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAllOrders } from "@/features/orders";
import { useAuthUser } from "@/lib/use-auth-user";
import { useReleaseStock } from "./use-stock";

export function ReleaseList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError } = useAllOrders();
  const release = useReleaseStock();
  const ready = (data ?? []).filter((row) =>
    ["payment_confirmed", "dispatched"].includes(row.status),
  );

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={ready.length === 0}
      emptyTitle="Nothing waiting to go out"
      emptyBody="Orders with confirmed payment will appear here for release."
    >
      <ul className="grid gap-3">
        {ready.map((row) => (
          <li key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.bag_count} bags · {row.kg_per_bag} kg
                </p>
                <p className="text-sm text-muted">{row.delivery_details}</p>
                <p className="mt-1 font-mono text-sm">
                  {pricePerKgKobo(row) > 0
                    ? `${formatNaira(pricePerKgKobo(row))} per kg · ${formatNaira(orderLineKobo(row))}`
                    : "No price yet"}
                </p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {user && row.warehouse_id ? (
              <ConfirmDialog
                title="Release these bags"
                body="This takes the bags out of store stock and marks the order as delivered."
                confirmLabel="Release"
                onConfirm={() =>
                  release.mutate({
                    orderId: row.id,
                    warehouseId: row.warehouse_id as string,
                    bagCount: row.bag_count,
                    kgPerBag: Number(row.kg_per_bag),
                    recordedBy: user.id,
                  })
                }
              >
                <Button className="mt-4" size="sm" type="button">
                  Release bags
                </Button>
              </ConfirmDialog>
            ) : (
              <p className="mt-3 text-sm text-muted">A store must be assigned before release.</p>
            )}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
