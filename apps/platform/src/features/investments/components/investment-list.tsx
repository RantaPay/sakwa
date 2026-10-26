"use client";

import { formatNaira, toLagosDate } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useInvestments } from "../hooks/use-investments";

export function InvestmentList({ investorId }: { investorId?: string }) {
  const { data, isLoading, isError } = useInvestments(investorId);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No capital recorded"
      emptyBody="When capital is written in, it will show here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="flex items-center justify-between p-4">
            <p className="text-sm text-muted">{toLagosDate(row.invested_on)}</p>
            <p className="font-mono font-semibold">{formatNaira(row.amount_kobo)}</p>
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
