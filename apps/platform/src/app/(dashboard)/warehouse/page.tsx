"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { GrantedHome } from "@/features/permissions/home-sections";
import { listStock } from "@/features/stock";
import { queryKeys } from "@/lib/query-keys";

export default function WarehouseHomePage() {
  const stock = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  const bags = (stock.data ?? []).reduce((sum, row) => sum + Number(row.bags_on_hand ?? 0), 0);
  const incoming = (stock.data ?? []).reduce((sum, row) => sum + Number(row.bags_in ?? 0), 0);
  const outgoing = (stock.data ?? []).reduce((sum, row) => sum + Number(row.bags_out ?? 0), 0);

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="warehouse"
          body="Confirm incoming bags, then release bags that are paid for. Confirmed bags are the books."
          stats={[
            { label: "On hand", value: `${bags} bags`, gold: true },
            { label: "Taken in", value: `${incoming}` },
            { label: "Sent out", value: `${outgoing}` },
          ]}
        />
      }
    >
      <GrantedHome role="warehouse" />
    </DashboardHome>
  );
}
