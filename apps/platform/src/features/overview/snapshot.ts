import { listAgentBalances } from "@/features/advances";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listInvestmentRequests, listPositions } from "@/features/investments";
import { listPayments, listTransactions } from "@/features/money";
import { listAllOrders } from "@/features/orders";
import { listStock, listWarehouses } from "@/features/stock";
import { listUsers } from "@/features/users";
import { listWithdrawals } from "@/features/withdrawals";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listAudit(limit = 8) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function loadSystemSnapshot() {
  const [
    people,
    stores,
    stock,
    balances,
    deliveries,
    orders,
    withdrawals,
    transactions,
    payments,
    positions,
    capitalRequests,
    audit,
  ] = await Promise.all([
    listUsers(),
    listWarehouses(),
    listStock(),
    listAgentBalances(),
    listWarehouseDeliveries(),
    listAllOrders(),
    listWithdrawals(),
    listTransactions(),
    listPayments(),
    listPositions(),
    listInvestmentRequests(),
    listAudit(8),
  ]);

  const names = new Map(stores.map((row) => [row.id, row.name]));
  const bagsOnHand = stock.reduce((sum, row) => sum + Number(row.bags_on_hand ?? 0), 0);
  const bagsIn = stock.reduce((sum, row) => sum + Number(row.bags_in ?? 0), 0);
  const bagsOut = stock.reduce((sum, row) => sum + Number(row.bags_out ?? 0), 0);
  const cashWithBuyers = balances.reduce((sum, row) => sum + Number(row.balance_kobo ?? 0), 0);
  const moneyIn = transactions
    .filter((row) => row.direction === "incoming")
    .reduce((sum, row) => sum + Number(row.amount_kobo ?? 0), 0);
  const moneyOut = transactions
    .filter((row) => row.direction === "outgoing")
    .reduce((sum, row) => sum + Number(row.amount_kobo ?? 0), 0);
  const capitalIn = positions.reduce((sum, row) => sum + Number(row.capital_kobo ?? 0), 0);

  const orderStatus = {
    placed: orders.filter((row) => row.status === "placed").length,
    payment_recorded: orders.filter((row) => row.status === "payment_recorded").length,
    payment_confirmed: orders.filter((row) => row.status === "payment_confirmed").length,
    dispatched: orders.filter((row) => row.status === "dispatched").length,
    delivered: orders.filter((row) => row.status === "delivered").length,
  };

  return {
    people: people.length,
    stores: stores.length,
    bagsOnHand,
    bagsIn,
    bagsOut,
    cashWithBuyers,
    pendingDeliveries: deliveries.filter((row) => row.status === "pending").length,
    openOrders: orders.filter((row) => row.status !== "delivered").length,
    paidWaitingRelease: orders.filter((row) =>
      ["payment_confirmed", "dispatched"].includes(row.status),
    ).length,
    profitWaiting: withdrawals.filter((row) => row.status === "requested").length,
    capitalWaiting: capitalRequests.filter((row) => row.status === "requested").length,
    moneyIn,
    moneyOut,
    payments: payments.length,
    capitalIn,
    personNames: people.map((row) => ({ id: row.id, name: row.full_name })),
    storeRows: stock.map((row) => ({
      id: row.warehouse_id,
      name: names.get(row.warehouse_id) ?? "Store",
      bags: Number(row.bags_on_hand ?? 0),
      kg: Number(row.kg_on_hand ?? 0),
    })),
    orderStatus,
    audit,
  };
}

export type SystemSnapshot = Awaited<ReturnType<typeof loadSystemSnapshot>>;
