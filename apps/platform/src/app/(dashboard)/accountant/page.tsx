"use client";

import { formatNaira, profitKobo } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { listTransactions } from "@/features/money";
import { GrantedHome } from "@/features/permissions/home-sections";
import { queryKeys } from "@/lib/query-keys";

export default function AccountantHomePage() {
  const transactions = useQuery({ queryKey: queryKeys.transactions, queryFn: listTransactions });
  const incoming = (transactions.data ?? [])
    .filter((row) => row.direction === "incoming")
    .reduce((sum, row) => sum + BigInt(row.amount_kobo), 0n);
  const outgoing = (transactions.data ?? [])
    .filter((row) => row.direction === "outgoing")
    .reduce((sum, row) => sum + BigInt(row.amount_kobo), 0n);

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="accountant"
          body="Write in cash given to agents, customer payments, and other money."
          stats={[
            { label: "Money in", value: formatNaira(incoming) },
            { label: "Money out", value: formatNaira(outgoing) },
            {
              label: "Result",
              value: formatNaira(profitKobo({ incomingKobo: incoming, outgoingKobo: outgoing })),
              gold: true,
            },
          ]}
        />
      }
    >
      <GrantedHome role="accountant" />
    </DashboardHome>
  );
}
