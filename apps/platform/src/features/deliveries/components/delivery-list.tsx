"use client";

import { StatusBadge } from "@sakwa/ui";
import { formatNaira, toLagosDate } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useAgentDeliveries } from "../hooks/use-deliveries";

export function DeliveryList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError } = useAgentDeliveries(user?.id);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No deliveries yet"
      emptyBody="Record bags you took to a store. They wait for confirmation."
    >
      <ul className="divide-y divide-border rounded-xl border border-border bg-white">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {row.bag_count} bags · {row.kg_per_bag} kg
              </p>
              <p className="text-sm text-muted">
                Spent {formatNaira(row.amount_spent_kobo)} · {toLagosDate(row.delivered_on)}
              </p>
            </div>
            <StatusBadge status={row.status} />
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
