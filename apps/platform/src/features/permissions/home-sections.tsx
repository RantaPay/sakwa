"use client";

import { useQuery } from "@tanstack/react-query";
import { SectionMark } from "@/components/shell/section-icons";
import { AdvanceForm, AdvanceList } from "@/features/advances";
import { DeliveryDecisionList, DeliveryForm, DeliveryList } from "@/features/deliveries";
import { InvestorDesk } from "@/features/investments";
import { PaymentBoard } from "@/features/money";
import { TradeBoard } from "@/features/overview";
import { OrderForm, OrderList } from "@/features/orders";
import { PriceCard } from "@/features/prices/price-card";
import { ReleaseList, StockBoard, listAssignedWarehouseIds } from "@/features/stock";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import type { Role } from "@sakwa/types";
import { homeFeatures } from "./access";
import { usePermissions } from "./provider";

function SectionTitle({ mark, children }: { mark: string; children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-xl font-semibold">
      <SectionMark mark={mark} size={22} className="size-12" />
      {children}
    </h2>
  );
}

function StoreTrade() {
  const { data: user } = useAuthUser();
  const assigned = useQuery({
    queryKey: queryKeys.warehouseStaff,
    enabled: Boolean(user?.id),
    queryFn: () => listAssignedWarehouseIds(user?.id as string),
  });
  if (!assigned.data) return null;
  return <TradeBoard warehouseIds={assigned.data} title="Expense / interest for this store" />;
}

export function FeatureHome({ featureId }: { featureId: string }) {
  switch (featureId) {
    case "trade":
      return <TradeBoard />;
    case "trade_store":
      return <StoreTrade />;
    case "buying_price":
      return <PriceCard />;
    case "cash_given":
      return (
        <section aria-label="Record cash given">
          <SectionTitle mark="cash_given">Record cash given</SectionTitle>
          <AdvanceForm />
          <AdvanceList />
        </section>
      );
    case "deliveries":
      return (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <section className="lg:col-span-5" aria-label="Record delivery">
            <SectionTitle mark="deliveries">Record a delivery</SectionTitle>
            <DeliveryForm />
          </section>
          <section className="lg:col-span-7" aria-label="Recent deliveries">
            <SectionTitle mark="deliveries">Recent deliveries</SectionTitle>
            <DeliveryList />
          </section>
        </div>
      );
    case "incoming":
      return (
        <section aria-label="Incoming to confirm">
          <SectionTitle mark="incoming">Incoming to confirm</SectionTitle>
          <DeliveryDecisionList />
        </section>
      );
    case "outgoing":
      return (
        <section aria-label="Release paid bags">
          <SectionTitle mark="outgoing">Release paid bags</SectionTitle>
          <ReleaseList />
        </section>
      );
    case "stock":
      return (
        <section aria-label="Stock">
          <SectionTitle mark="stock">Stock</SectionTitle>
          <StockBoard />
        </section>
      );
    case "customer_payments":
      return (
        <section aria-label="Customer payments">
          <SectionTitle mark="customer_payments">Customer payments</SectionTitle>
          <PaymentBoard />
        </section>
      );
    case "customer_orders":
      return (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <section className="lg:col-span-5" aria-label="Place an order">
            <SectionTitle mark="customer_orders">Place an order</SectionTitle>
            <OrderForm />
          </section>
          <section className="lg:col-span-7" aria-label="Your orders">
            <SectionTitle mark="customer_orders">Open orders</SectionTitle>
            <OrderList />
          </section>
        </div>
      );
    case "ask_to_invest":
      return <InvestorDesk />;
    default:
      return null;
  }
}

export function GrantedHome({ role }: { role: Role }) {
  const { rows } = usePermissions();
  const features = homeFeatures(role, rows);
  if (!features.length) return null;
  return (
    <div className="space-y-10">
      {features.map((feature) => (
        <FeatureHome key={feature.id} featureId={feature.id} />
      ))}
    </div>
  );
}
