import { formatNaira } from "@sakwa/utils";

export type AuditEntry = {
  id: string;
  table_name: string;
  action: string;
  actor_id: string | null;
  before_value: unknown;
  after_value: unknown;
  created_at: string;
};

const TABLE_LABEL: Record<string, string> = {
  agent_deliveries: "delivery",
  agent_cash_advances: "cash given to an agent",
  orders: "order",
  customer_payments: "customer payment",
  transactions: "other money",
  investments: "investment",
  investment_requests: "investment request",
  investor_returns: "weekly return",
  withdrawal_requests: "profit request",
  investor_enquiries: "enquiry",
  profiles: "profile",
  user_roles: "role",
  warehouses: "store",
  warehouse_staff: "store assignment",
  stock_movements: "stock movement",
  buying_rates: "buying price",
  market_prices: "house price",
  house_settings: "weekly interest",
  role_permissions: "permission",
};

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function statusOf(value: Record<string, unknown> | null) {
  const status = value?.status;
  return typeof status === "string" ? status.replaceAll("_", " ") : "";
}

function kobo(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "";
  return formatNaira(amount);
}

function naira(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function named(names: Map<string, string> | undefined, id: unknown, label: string) {
  if (!names || typeof id !== "string") return "";
  const person = names.get(id);
  return person ? `${label} ${person}` : "";
}

function detailBits(value: Record<string, unknown> | null, names?: Map<string, string>) {
  if (!value) return [];
  const bits: string[] = [];
  const bags = value.bag_count;
  const each = value.kg_per_bag;
  if (bags != null && each != null && Number.isFinite(Number(bags)) && Number.isFinite(Number(each))) {
    const kg = Number(bags) * Number(each);
    bits.push(`${bags} bags, ${kg.toLocaleString("en-NG")} kg`);
  } else if (bags != null) {
    bits.push(`${bags} bags`);
  }

  const spentKobo = kobo(value.amount_spent_kobo);
  const amount = kobo(value.amount_kobo);
  if (spentKobo) bits.push(`${spentKobo} spent`);
  else if (value.amount_spent != null) {
    const spent = naira(value.amount_spent);
    if (spent) bits.push(`${spent} spent`);
  }
  if (amount) bits.push(amount);

  if (value.price_per_kg_kobo != null) {
    const perKg = kobo(value.price_per_kg_kobo);
    if (perKg) bits.push(`${perKg} per kg`);
  }
  if (value.buying_price_per_kg_kobo != null || value.selling_price_per_kg_kobo != null) {
    const buy = kobo(value.buying_price_per_kg_kobo);
    const sell = kobo(value.selling_price_per_kg_kobo);
    if (buy) bits.push(`buy ${buy} per kg`);
    if (sell) bits.push(`sell ${sell} per kg`);
  }
  if (value.price_per_bag_kobo != null) {
    const perBag = kobo(value.price_per_bag_kobo);
    if (perBag) bits.push(`${perBag} per bag`);
  }
  if (value.weekly_interest_bps != null && Number.isFinite(Number(value.weekly_interest_bps))) {
    bits.push(`${Number(value.weekly_interest_bps) / 100}% a week`);
  }

  const customer = named(names, value.customer_id, "Customer");
  const agent = named(names, value.agent_id, "Agent");
  const investor = named(names, value.investor_id, "Investor");
  if (customer) bits.push(customer);
  if (agent) bits.push(agent);
  if (investor) bits.push(investor);
  if (typeof value.full_name === "string" && value.full_name) bits.push(value.full_name);
  if (typeof value.category === "string" && value.category) bits.push(value.category);
  if (typeof value.description === "string" && value.description) bits.push(value.description);
  if (typeof value.direction === "string") {
    const direction =
      value.direction === "incoming"
        ? "Money in"
        : value.direction === "outgoing"
          ? "Money out"
          : value.direction === "in"
            ? "In"
            : value.direction === "out"
              ? "Out"
              : value.direction;
    bits.push(direction);
  }
  if (typeof value.notes === "string" && value.notes) bits.push(value.notes);
  if (typeof value.cycle_start === "string") bits.push(`Week of ${value.cycle_start}`);
  if (typeof value.invested_on === "string") bits.push(`Invested ${value.invested_on}`);
  if (typeof value.delivered_on === "string") bits.push(`Delivered ${value.delivered_on}`);
  if (typeof value.occurred_on === "string") bits.push(value.occurred_on);
  if (typeof value.rejection_reason === "string" && value.rejection_reason) bits.push(value.rejection_reason);
  return bits;
}

export function describeAudit(row: AuditEntry, names?: Map<string, string>) {
  const after = record(row.after_value);
  const before = record(row.before_value);
  const noun = TABLE_LABEL[row.table_name] ?? row.table_name.replaceAll("_", " ");
  const nextStatus = statusOf(after);
  const prevStatus = statusOf(before);
  const actor = row.actor_id ? names?.get(row.actor_id) : undefined;
  const head = noun[0]?.toUpperCase() ?? "";
  let title = `New ${noun}`;
  if (row.action === "delete") title = `Removed ${noun}`;
  if (row.action === "update" && nextStatus && nextStatus !== prevStatus) {
    title = `${head}${noun.slice(1)} is now ${nextStatus}`;
  } else if (row.action === "update") {
    title = `Updated ${head.toLowerCase()}${noun.slice(1)}`;
  }
  const bits = detailBits(after ?? before, names);
  if (prevStatus && nextStatus && prevStatus !== nextStatus) bits.unshift(`It was ${prevStatus}`);
  const detail = [actor ? `By ${actor}` : "", bits.join(". ")].filter(Boolean).join(". ");
  return { title, detail: detail || "No further detail was stored." };
}
