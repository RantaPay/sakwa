"use client";

import { formatNaira, toLagosDate } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useReturns } from "./use-returns";

export function ReturnList({ investorId }: { investorId?: string }) {
  const { data, isLoading, isError } = useReturns(investorId);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No returns yet"
      emptyBody="When a weekly return is written in, it will show here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between p-4">
            <p className="text-sm text-muted">Week of {toLagosDate(row.cycle_start)}</p>
            <p className="font-mono font-semibold">{formatNaira(row.amount_kobo)}</p>
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
