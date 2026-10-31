"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardHome } from "@/components/dashboard-home";
import { WelcomeCard } from "@/components/welcome-card";
import { listCustomerOrders } from "@/features/orders";
import { GrantedHome } from "@/features/permissions/home-sections";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";

export default function CustomerHomePage() {
  const { data: user } = useAuthUser();
  const orders = useQuery({
    queryKey: queryKeys.orders(user?.id),
    enabled: Boolean(user?.id),
    queryFn: () => listCustomerOrders(user?.id as string),
  });
  const open = (orders.data ?? []).filter((row) => row.status !== "delivered").length;

  return (
    <DashboardHome
      greeting={
        <WelcomeCard
          role="customer"
          body="Place an order, pay offline, and watch it through to delivery."
          stats={[
            { label: "Open orders", value: `${open}` },
            { label: "All orders", value: `${orders.data?.length ?? 0}` },
          ]}
        />
      }
    >
      <GrantedHome role="customer" />
    </DashboardHome>
  );
}
