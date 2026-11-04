"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { PendingOrdersCard } from "@/features/orders";
import { GrantedHome } from "@/features/permissions/home-sections";
import { StoreDayButton } from "@/features/reports/daily-buttons";
import { MovementList, listStock } from "@/features/stock";
import { useStoreScope } from "@/features/stock/use-store-scope";
import { queryKeys } from "@/lib/query-keys";

export default function WarehouseHomePage() {
  const stock = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  const scope = useStoreScope();
  const mine = (stock.data ?? []).filter(
    (row) => !scope.limited || (scope.ids ?? []).includes(row.warehouse_id),
  );
  const bags = mine.reduce((sum, row) => sum + Number(row.bags_on_hand ?? 0), 0);
  const incoming = mine.reduce((sum, row) => sum + Number(row.bags_in ?? 0), 0);
  const outgoing = mine.reduce((sum, row) => sum + Number(row.bags_out ?? 0), 0);

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
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PendingOrdersCard mode="warehouse" />
          <StoreDayButton warehouseIds={scope.ids} />
        </div>
        <section>
          <h2 className="mb-3 text-xl font-semibold">Recent activity</h2>
          <MovementList />
        </section>
        <GrantedHome role="warehouse" />
      </div>
    </DashboardHome>
  );
}
