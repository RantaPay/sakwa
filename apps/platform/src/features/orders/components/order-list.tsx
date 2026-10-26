"use client";

import { StatusBadge } from "@sakwa/ui";
import { formatNaira, toLagosDateTime } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useCustomerOrders } from "../hooks/use-orders";

export function OrderList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError } = useCustomerOrders(user?.id);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No orders yet"
      emptyBody="Place an order and staff will write in the price and the payment."
    >
      <ul className="grid gap-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.bag_count} bags · {row.kg_per_bag} kg
                </p>
                <p className="text-sm text-muted">{row.delivery_details}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <p className="mt-3 font-mono text-sm">
              {row.price_per_bag_kobo > 0
                ? `${formatNaira(row.price_per_bag_kobo)} per bag`
                : "Price not set yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{toLagosDateTime(row.created_at)}</p>
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
