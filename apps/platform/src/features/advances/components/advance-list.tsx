"use client";

import { formatNaira, toLagosDate } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAdvances } from "../hooks/use-advances";

export function AdvanceList({ agentId }: { agentId?: string }) {
  const { data, isLoading, isError } = useAdvances(agentId);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No cash given yet"
      emptyBody="When cash is given to a field buyer, it will show here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono font-semibold">{formatNaira(row.amount_kobo)}</p>
              <p className="text-xs text-muted">{toLagosDate(row.advanced_on)}</p>
            </div>
            {row.notes ? <p className="text-sm text-muted">{row.notes}</p> : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
