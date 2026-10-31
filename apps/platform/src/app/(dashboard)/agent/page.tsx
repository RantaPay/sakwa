"use client";

import { agentBalanceLabel, formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { getAgentBalance } from "@/features/advances";
import { GrantedHome } from "@/features/permissions/home-sections";
import { listMarketPrices } from "@/features/prices/market-prices";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";

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
  const rates = useQuery({ queryKey: queryKeys.marketPrices, queryFn: listMarketPrices });
  const kobo = BigInt(balance.data?.balance_kobo ?? 0);
  const kind = agentBalanceLabel(kobo);
  const latest = rates.data?.[0];

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="agent"
          body="See cash with you, follow the buying price, and record bags sent to a store."
          stats={[
            { label: LABEL[kind], value: formatNaira(kobo < 0n ? -kobo : kobo), gold: true },
            { label: "Cash given", value: formatNaira(balance.data?.advanced_kobo ?? 0) },
            {
              label: "Buying per kg",
              value: latest ? formatNaira(latest.buying_price_per_kg_kobo) : "Not set",
            },
          ]}
        />
      }
    >
      <GrantedHome role="agent" />
    </DashboardHome>
  );
}
