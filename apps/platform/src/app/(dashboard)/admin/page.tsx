"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { OverviewBoard } from "@/features/overview";
import { PriceCard } from "@/features/prices/price-card";
import { listWarehouses } from "@/features/stock";
import { listUsers } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";

export default function AdminHomePage() {
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="admin"
          body="The whole house is on this page. People, stores, bags, and money, in one view."
          stats={[
            { label: "People", value: `${people.data?.length ?? 0}` },
            { label: "Stores", value: `${stores.data?.length ?? 0}` },
          ]}
        />
      }
    >
      <div className="space-y-4 xl:space-y-5">
        <PriceCard />
        <OverviewBoard />
      </div>
    </DashboardHome>
  );
}
