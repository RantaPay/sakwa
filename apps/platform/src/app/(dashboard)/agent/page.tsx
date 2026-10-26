"use client";

import { StatCard } from "@sakwa/ui";
import { agentBalanceLabel, formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { getAgentBalance } from "@/features/advances";
import { useAuthUser } from "@/hooks/use-auth-user";

const LABEL = {
  cash_left: "Cash with you",
  agent_added: "You added your own money",
  even: "Even",
} as const;

export default function AgentHomePage() {
  const { data: user } = useAuthUser();
  const balance = useQuery({
    queryKey: ["agent-balance", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getAgentBalance(user?.id as string),
  });
  const kobo = BigInt(balance.data?.balance_kobo ?? 0);
  const kind = agentBalanceLabel(kobo);

  return (
    <div>
      <PageHeading
        title="Field buyer"
        body="See cash received, record deliveries, and watch your running balance."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatCard label={LABEL[kind]} value={formatNaira(kobo < 0n ? -kobo : kobo)} gold />
        <StatCard
          label="Cash given"
          value={formatNaira(balance.data?.advanced_kobo ?? 0)}
        />
      </div>
    </div>
  );
}
