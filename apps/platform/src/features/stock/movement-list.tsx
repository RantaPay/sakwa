"use client";

import { StatusBadge } from "@sakwa/ui";
import { toLagosDateTime } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useMovements } from "./use-stock";

export function MovementList() {
  const { data, isLoading, isError } = useMovements();

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No movements"
      emptyBody="Incoming and outgoing bags will list here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {row.bag_count} bags · {row.total_kg} kg
              </p>
              <p className="text-xs text-muted">{toLagosDateTime(row.created_at)}</p>
            </div>
            <StatusBadge status={row.direction === "in" ? "incoming" : "outgoing"} />
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
