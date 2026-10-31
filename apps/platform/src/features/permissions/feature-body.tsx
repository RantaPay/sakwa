"use client";

import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { AdvanceForm, AdvanceList, listAgentBalances } from "@/features/advances";
import { DeliveryDecisionList, DeliveryForm, DeliveryList } from "@/features/deliveries";
import { EnquiryList } from "@/features/enquiries";
import { InvestmentForm, InvestmentList, InvestmentRequestList, InvestorDesk } from "@/features/investments";
import { PaymentBoard, TransactionBoard } from "@/features/money";
import { TradeBoard } from "@/features/overview";
import { OrderForm, OrderList, OrderPriceList } from "@/features/orders";
import { PriceCard } from "@/features/prices/price-card";
import { AnalyticsPanel } from "@/features/analytics";
import { ReportsPanel } from "@/features/reports";
import { ReturnList, ReturnsPanel } from "@/features/returns";
import {
  MovementList,
  ReleaseList,
  StockBoard,
  listAssignedWarehouseIds,
  listStock,
  listWarehouses,
} from "@/features/stock";
import { ProfileForm, listUsers } from "@/features/users";
import { WithdrawalForm, WithdrawalList } from "@/features/withdrawals";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";

function StoreTradeScreen() {
  const { data: user } = useAuthUser();
  const assigned = useQuery({
    queryKey: queryKeys.warehouseStaff,
    enabled: Boolean(user?.id),
    queryFn: () => listAssignedWarehouseIds(user?.id as string),
  });
  if (!assigned.data) return null;
  return <TradeBoard warehouseIds={assigned.data} title="Expense / interest for this store" />;
}

function FieldBuyersScreen() {
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

function StoresScreen() {
  const stock = useQuery({ queryKey: queryKeys.stock, queryFn: listStock });
  const stores = useQuery({ queryKey: queryKeys.warehouses, queryFn: listWarehouses });
  const names = new Map((stores.data ?? []).map((row) => [row.id, row.name]));
  return (
    <div>
      <PageHeading mark="stores" title="Stores" body="Confirmed bags in, minus bags released." />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(stock.data ?? []).map((row) => (
          <li key={row.warehouse_id} className="p-4">
            <p className="text-sm text-muted">{names.get(row.warehouse_id) ?? "Store"}</p>
            <p className="font-mono text-2xl">{row.bags_on_hand} bags</p>
            <p className="text-sm text-muted">{row.kg_on_hand} kg on hand</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OwnCashScreen() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading mark="cash_received" title="Cash received" body="Every amount given to you by the enterprise." />
      {user ? <AdvanceList agentId={user.id} /> : null}
    </div>
  );
}

function OwnProfitScreen() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading
        mark="investor_profit"
        title="Profit out"
        body="One request per week. Give the account we should pay. Confirm when the money lands."
      />
      <WithdrawalForm />
      {user ? <WithdrawalList investorId={user.id} mode="own" /> : null}
    </div>
  );
}

function OwnReturnsScreen() {
  const { data: user } = useAuthUser();
  return (
    <div>
      <PageHeading mark="investor_returns" title="Returns" body="Profit credited to you, week by week." />
      {user ? <ReturnList investorId={user.id} /> : null}
    </div>
  );
}

export function FeatureBody({
  featureId,
  weeklyPercentBps,
}: {
  featureId: string;
  weeklyPercentBps: number;
}) {
  switch (featureId) {
    case "trade":
      return (
        <div>
          <PageHeading
            mark="trade"
            title="Expense / interest"
            body="What was sold at the selling price, minus what was bought at the buying price."
          />
          <TradeBoard />
        </div>
      );
    case "trade_store":
      return (
        <div>
          <PageHeading
            mark="trade_store"
            title="Expense / interest for this store"
            body="What this store sold at the selling price, minus what it bought at the buying price."
          />
          <StoreTradeScreen />
        </div>
      );
    case "buying_price":
      return <PriceCard />;
    case "cash_given":
      return (
        <div>
          <PageHeading mark="cash_given" title="Cash given" body="Record cash given to an agent." />
          <AdvanceForm />
          <AdvanceList />
        </div>
      );
    case "cash_received":
      return <OwnCashScreen />;
    case "deliveries":
      return (
        <div className="space-y-6">
          <PageHeading mark="deliveries" title="Deliveries" body="Record bags supplied to a store." />
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <section className="lg:col-span-5" aria-label="Record delivery">
              <DeliveryForm />
            </section>
            <section className="lg:col-span-7" aria-label="Delivery history">
              <DeliveryList />
            </section>
          </div>
        </div>
      );
    case "field_buyers":
      return <FieldBuyersScreen />;
    case "stores":
      return <StoresScreen />;
    case "incoming":
      return (
        <div>
          <PageHeading
            mark="incoming"
            title="Incoming"
            body="Confirm bags that arrived. Only confirmed bags go on the books."
          />
          <DeliveryDecisionList />
        </div>
      );
    case "outgoing":
      return (
        <div>
          <PageHeading
            mark="outgoing"
            title="Outgoing"
            body="Release bags after payment is confirmed. This marks the order delivered."
          />
          <ReleaseList />
        </div>
      );
    case "stock":
      return (
        <div className="space-y-10">
          <PageHeading mark="stock" title="Stock" body="Bags on hand, plus every in and out." />
          <StockBoard />
          <MovementList />
        </div>
      );
    case "orders":
      return (
        <div>
          <PageHeading
            mark="orders"
            title="Orders"
            body="Set the price per kg for each order. A store can be assigned here or later."
          />
          <OrderPriceList />
        </div>
      );
    case "customer_payments":
      return (
        <div>
          <PageHeading
            mark="customer_payments"
            title="Customer payments"
            body="Write in a payment, then confirm it before rice is released."
          />
          <PaymentBoard />
        </div>
      );
    case "customer_orders":
      return (
        <div>
          <PageHeading
            mark="customer_orders"
            title="Orders"
            body="Staff set the price per order. Payment is made offline before rice is released."
          />
          <OrderForm />
          <OrderList />
        </div>
      );
    case "other_money":
      return (
        <div>
          <PageHeading
            mark="other_money"
            title="Other money"
            body="Any incoming or outgoing amount that is not an order payment or cash given to an agent."
          />
          <TransactionBoard />
        </div>
      );
    case "reports":
      return (
        <div>
          <PageHeading mark="reports" title="Reports" body="Download the money list as Excel or PDF." />
          <ReportsPanel />
        </div>
      );
    case "capital_requests":
      return (
        <div>
          <PageHeading
            mark="capital_requests"
            title="Investment requests"
            body="Accept a request to send the house account. Confirm the receipt before the investment and interest go on the books."
          />
          <InvestmentRequestList mode="review" />
        </div>
      );
    case "ask_to_invest":
      return (
        <div>
          <PageHeading
            mark="ask_to_invest"
            title="Ask to invest"
            body="Pay the house account, upload the receipt, and interest starts after it is confirmed."
          />
          <InvestorDesk />
        </div>
      );
    case "capital":
      return (
        <div>
          <PageHeading mark="capital" title="Capital" body="Write in the amount each investor put in." />
          <InvestmentForm />
          <InvestmentList />
        </div>
      );
    case "profit_requests":
      return (
        <div>
          <PageHeading
            mark="profit_requests"
            title="Profit requests"
            body="Accept a request, pay the investor, then upload the transfer receipt. They confirm when the money lands."
          />
          <WithdrawalList mode="review" />
        </div>
      );
    case "profit_pay":
      return (
        <div>
          <PageHeading
            mark="profit_pay"
            title="Profit out"
            body="After the director accepts a request, pay the investor and upload the transfer receipt."
          />
          <WithdrawalList mode="pay" />
        </div>
      );
    case "investor_profit":
      return <OwnProfitScreen />;
    case "returns_desk":
      return <ReturnsPanel weeklyPercentBps={weeklyPercentBps} />;
    case "investor_returns":
      return <OwnReturnsScreen />;
    case "enquiries":
      return (
        <div>
          <PageHeading
            mark="enquiries"
            title="Enquiries"
            body="Messages from the public site. Mark them contacted or closed after you reply."
          />
          <EnquiryList />
        </div>
      );
    case "analytics":
      return (
        <div>
          <PageHeading
            mark="analytics"
            title="Analytics"
            body="Expense, interest, and every amount in or out. Download the same list as CSV or PDF."
          />
          <AnalyticsPanel />
        </div>
      );
    case "profile":
      return (
        <div>
          <PageHeading mark="profile" title="Profile" body="Keep the details for your role current." />
          <ProfileForm />
        </div>
      );
    default:
      return null;
  }
}
