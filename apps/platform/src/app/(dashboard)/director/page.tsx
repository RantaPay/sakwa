"use client";

import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { listAgentBalances } from "@/features/advances";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listInvestmentRequests } from "@/features/investments";
import { GrantedHome } from "@/features/permissions/home-sections";
import { listStock } from "@/features/stock";
import { listWithdrawals } from "@/features/withdrawals";
import { queryKeys } from "@/lib/query-keys";

export default function DirectorHomePage() {
  const stock = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  const balances = useQuery({ queryKey: queryKeys.agentBalances, queryFn: listAgentBalances });
  const deliveries = useQuery({
    queryKey: queryKeys.deliveries(),
    queryFn: listWarehouseDeliveries,
  });
  const withdrawals = useQuery({
    queryKey: queryKeys.withdrawals(),
    queryFn: () => listWithdrawals(),
  });
  const capital = useQuery({
    queryKey: queryKeys.investmentRequests(),
    queryFn: () => listInvestmentRequests(),
  });

  const bags = (stock.data ?? []).reduce((sum, row) => sum + Number(row.bags_on_hand ?? 0), 0);
  const cashOut = (balances.data ?? []).reduce((sum, row) => sum + Number(row.balance_kobo ?? 0), 0);
  const pendingIn = (deliveries.data ?? []).filter((row) => row.status === "pending").length;
  const pendingProfit = (withdrawals.data ?? []).filter((row) => row.status === "requested").length;
  const pendingCapital = (capital.data ?? []).filter((row) => row.status === "requested").length;

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="director"
          body="Watch prices, stock, field cash, and requests from here."
          stats={[
            { label: "Bags on hand", value: `${bags}` },
            { label: "Cash in the field", value: formatNaira(cashOut), gold: true },
            { label: "Incoming", value: `${pendingIn}` },
            { label: "Profit waiting", value: `${pendingProfit}` },
            { label: "Investment requests", value: `${pendingCapital}` },
          ]}
        />
      }
    >
      <GrantedHome role="director" />
    </DashboardHome>
  );
}
