import { bookDay, deliveryTotalKg, formatNaira, lineTotalKobo, priceForDay } from "@sakwa/utils";
import { listAdvances, listAgentBalances } from "@/features/advances";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listInvestments } from "@/features/investments";
import { listPayments, listTransactions } from "@/features/money";
import { listAllOrders } from "@/features/orders";
import { listMarketPrices } from "@/features/prices/market-prices";
import { listReturns } from "@/features/returns";
import { listWarehouses } from "@/features/stock";
import { listUsers } from "@/features/users";
import { listWithdrawals } from "@/features/withdrawals";

const SOLD = new Set(["payment_confirmed", "dispatched", "delivered"]);

export type LedgerLine = {
  id: string;
  date: string;
  group: "rice" | "cash" | "interest";
  direction: "in" | "out";
  title: string;
  who: string;
  detail: string;
  amountKobo: number;
};

export type PersonRollup = {
  id: string;
  name: string;
  note: string;
  primary: string;
  secondary: string;
};

export type AnalyticsReport = {
  expenseKobo: number;
  salesKobo: number;
  interestKobo: number;
  cashInKobo: number;
  cashOutKobo: number;
  investorInterestKobo: number;
  lines: LedgerLine[];
  agents: PersonRollup[];
  customers: PersonRollup[];
};

function nameOf(names: Map<string, string>, id: string | null | undefined, fallback: string) {
  if (!id) return fallback;
  return names.get(id) ?? fallback;
}

export async function loadAnalytics(): Promise<AnalyticsReport> {
  const [
    people,
    stores,
    deliveries,
    orders,
    rates,
    payments,
    transactions,
    advances,
    investments,
    withdrawals,
    returns,
    balances,
  ] = await Promise.all([
    listUsers(),
    listWarehouses(),
    listWarehouseDeliveries(),
    listAllOrders(),
    listMarketPrices(),
    listPayments(),
    listTransactions(),
    listAdvances(),
    listInvestments(),
    listWithdrawals(),
    listReturns(),
    listAgentBalances(),
  ]);

  const names = new Map(people.map((row) => [row.id, row.full_name]));
  const storeNames = new Map(stores.map((row) => [row.id, row.name]));
  const lines: LedgerLine[] = [];

  for (const row of deliveries) {
    if (row.status !== "confirmed") continue;
    const day = bookDay(row.delivered_on);
    const price = priceForDay(rates, day);
    const amount = lineTotalKobo(
      price?.buying_price_per_kg_kobo ?? 0,
      Number(row.bag_count),
      row.kg_per_bag,
    );
    const kg = deliveryTotalKg(Number(row.bag_count), Number(row.kg_per_bag));
    const priced = Boolean(price?.buying_price_per_kg_kobo);
    lines.push({
      id: `buy-${row.id}`,
      date: day,
      group: "rice",
      direction: "out",
      title: "Expense",
      who: nameOf(names, row.agent_id, "Agent"),
      detail: `${row.bag_count} bags, ${kg} kg, into ${storeNames.get(row.warehouse_id) ?? "a store"}${priced ? "" : ". No house buying price was set for this day"}`,
      amountKobo: amount,
    });
  }

  for (const row of orders) {
    if (!SOLD.has(row.status)) continue;
    const day = bookDay(row.created_at);
    const price = priceForDay(rates, day);
    const amount = lineTotalKobo(
      price?.selling_price_per_kg_kobo ?? 0,
      Number(row.bag_count),
      row.kg_per_bag,
    );
    const kg = deliveryTotalKg(Number(row.bag_count), Number(row.kg_per_bag));
    const priced = Boolean(price?.selling_price_per_kg_kobo);
    lines.push({
      id: `sell-${row.id}`,
      date: day,
      group: "rice",
      direction: "in",
      title: "Sales",
      who: nameOf(names, row.customer_id, "Customer"),
      detail: `${row.bag_count} bags, ${kg} kg${row.warehouse_id ? `, from ${storeNames.get(row.warehouse_id) ?? "a store"}` : ""}${priced ? "" : ". No house selling price was set for this day"}`,
      amountKobo: amount,
    });
  }

  for (const row of payments) {
    const order = orders.find((item) => item.id === row.order_id);
    lines.push({
      id: `pay-${row.id}`,
      date: bookDay(row.created_at),
      group: "cash",
      direction: "in",
      title: "Customer payment",
      who: nameOf(names, order?.customer_id, "Customer"),
      detail: row.notes || "Payment on an order",
      amountKobo: Number(row.amount_kobo),
    });
  }

  for (const row of transactions) {
    const incoming = row.direction === "incoming";
    lines.push({
      id: `txn-${row.id}`,
      date: bookDay(row.occurred_on),
      group: "cash",
      direction: incoming ? "in" : "out",
      title: row.category,
      who: nameOf(names, row.recorded_by, "Staff"),
      detail: row.description,
      amountKobo: Number(row.amount_kobo),
    });
  }

  for (const row of advances) {
    lines.push({
      id: `adv-${row.id}`,
      date: bookDay(row.advanced_on),
      group: "cash",
      direction: "out",
      title: "Cash to agent",
      who: nameOf(names, row.agent_id, "Agent"),
      detail: row.notes || "Cash handed out",
      amountKobo: Number(row.amount_kobo),
    });
  }

  for (const row of investments) {
    lines.push({
      id: `inv-${row.id}`,
      date: bookDay(row.invested_on),
      group: "cash",
      direction: "in",
      title: "Investment in",
      who: nameOf(names, row.investor_id, "Investor"),
      detail: row.notes || "Capital placed",
      amountKobo: Number(row.amount_kobo),
    });
  }

  for (const row of returns) {
    lines.push({
      id: `ret-${row.id}`,
      date: bookDay(row.cycle_start),
      group: "interest",
      direction: "out",
      title: "Investor interest",
      who: nameOf(names, row.investor_id, "Investor"),
      detail: `Written for the week of ${row.cycle_start}`,
      amountKobo: Number(row.amount_kobo),
    });
  }

  for (const row of withdrawals) {
    if (row.status !== "paid" && row.status !== "receipt_sent") continue;
    lines.push({
      id: `wth-${row.id}`,
      date: bookDay(row.paid_at ?? row.receipt_uploaded_at ?? row.updated_at),
      group: "cash",
      direction: "out",
      title: "Profit paid",
      who: nameOf(names, row.investor_id, "Investor"),
      detail: row.payout_account_name
        ? `To ${row.payout_account_name}, ${row.payout_bank_name ?? ""} ${row.payout_account_number ?? ""}`.trim()
        : "Profit sent to the investor",
      amountKobo: Number(row.amount_kobo),
    });
  }

  lines.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

  const expenseKobo = lines
    .filter((row) => row.group === "rice" && row.direction === "out")
    .reduce((sum, row) => sum + row.amountKobo, 0);
  const salesKobo = lines
    .filter((row) => row.group === "rice" && row.direction === "in")
    .reduce((sum, row) => sum + row.amountKobo, 0);
  const cashInKobo = lines
    .filter((row) => row.group === "cash" && row.direction === "in")
    .reduce((sum, row) => sum + row.amountKobo, 0);
  const cashOutKobo = lines
    .filter((row) => row.group === "cash" && row.direction === "out")
    .reduce((sum, row) => sum + row.amountKobo, 0);
  const investorInterestKobo = returns.reduce((sum, row) => sum + Number(row.amount_kobo), 0);

  const spentByAgent = new Map<string, number>();
  const deliveriesByAgent = new Map<string, number>();
  for (const row of deliveries) {
    if (row.status !== "confirmed") continue;
    deliveriesByAgent.set(row.agent_id, (deliveriesByAgent.get(row.agent_id) ?? 0) + 1);
    spentByAgent.set(
      row.agent_id,
      (spentByAgent.get(row.agent_id) ?? 0) + Number(row.amount_spent_kobo),
    );
  }
  const givenByAgent = new Map<string, number>();
  for (const row of advances) {
    givenByAgent.set(row.agent_id, (givenByAgent.get(row.agent_id) ?? 0) + Number(row.amount_kobo));
  }
  const agentIds = new Set<string>([
    ...balances.map((row) => row.agent_id),
    ...givenByAgent.keys(),
    ...spentByAgent.keys(),
  ]);

  const paidByCustomer = new Map<string, number>();
  const orderById = new Map(orders.map((row) => [row.id, row]));
  for (const row of payments) {
    const order = orderById.get(row.order_id);
    const customerId = order?.customer_id;
    if (!customerId) continue;
    paidByCustomer.set(customerId, (paidByCustomer.get(customerId) ?? 0) + Number(row.amount_kobo));
  }
  const bagsByCustomer = new Map<string, number>();
  const ordersByCustomer = new Map<string, number>();
  for (const row of orders) {
    ordersByCustomer.set(row.customer_id, (ordersByCustomer.get(row.customer_id) ?? 0) + 1);
    bagsByCustomer.set(row.customer_id, (bagsByCustomer.get(row.customer_id) ?? 0) + Number(row.bag_count));
  }
  const customerIds = new Set<string>([...ordersByCustomer.keys(), ...paidByCustomer.keys()]);

  return {
    expenseKobo,
    salesKobo,
    interestKobo: salesKobo - expenseKobo,
    cashInKobo,
    cashOutKobo,
    investorInterestKobo,
    lines,
    agents: [...agentIds]
      .map((id) => {
        const person = people.find((row) => row.id === id);
        const given = givenByAgent.get(id) ?? 0;
        const spent = spentByAgent.get(id) ?? 0;
        return {
          id,
          name: person?.full_name ?? "Agent",
          note: person?.area || "No buying area yet",
          primary: `${deliveriesByAgent.get(id) ?? 0} confirmed deliveries`,
          secondary: `Given ${formatNaira(given)} · spent ${formatNaira(spent)} · still with them ${formatNaira(given - spent)}`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    customers: [...customerIds]
      .map((id) => {
        const person = people.find((row) => row.id === id);
        return {
          id,
          name: person?.full_name ?? "Customer",
          note: person?.shop_name || person?.address || "No shop recorded",
          primary: `${ordersByCustomer.get(id) ?? 0} orders, ${bagsByCustomer.get(id) ?? 0} bags`,
          secondary: `Paid ${formatNaira(paidByCustomer.get(id) ?? 0)}`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
