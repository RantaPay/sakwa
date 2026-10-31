"use client";

import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { listAgentBalances } from "@/features/advances";
import { listUsers } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";

export default function DirectorAgentsPage() {
  const balances = useQuery({ queryKey: queryKeys.agentBalances, queryFn: listAgentBalances });
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));

  return (
    <div>
      <PageHeading
        mark="field_buyers"
        title="Agents"
        body="Balance is cash given minus spend on confirmed deliveries. A minus means the agent added their own money."
      />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(balances.data ?? []).map((row) => (
          <li key={row.agent_id} className="flex items-center justify-between p-4">
            <p className="font-semibold">{names.get(row.agent_id) ?? "Agent"}</p>
            <p className="font-mono font-semibold">{formatNaira(row.balance_kobo)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
