import {
  clearDemoSession,
  readDemoSessionFromDocument,
  writeDemoSession,
  type DemoAccount,
} from "./accounts";
import { DEMO_TABLE_DATA } from "./mock";

type QueryResult = { data: unknown; error: null; count: number };
type Filter = { field: string; value: unknown; op: "eq" | "in" };
type Row = Record<string, unknown>;
type Pending =
  | { type: "insert"; payload: unknown }
  | { type: "update"; payload: Row }
  | { type: "delete" }
  | { type: "upsert"; payload: unknown };

const STORE_KEY = "sakwa-mock-store-v3";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asRows(payload: unknown): Row[] {
  if (Array.isArray(payload)) return payload as Row[];
  if (payload && typeof payload === "object") return [payload as Row];
  return [];
}

function sum(rows: Row[], field: string) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function loadStore(): Record<string, Row[]> {
  const seed = clone(DEMO_TABLE_DATA) as Record<string, Row[]>;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Row[]>;
        for (const [table, rows] of Object.entries(parsed)) {
          if (Array.isArray(rows) && rows.length > 0) seed[table] = rows;
        }
      }
    } catch {
      /* seed below */
    }
  }
  return seed;
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function recomputeDerived() {
  const advances = store.agent_cash_advances ?? [];
  const deliveries = store.agent_deliveries ?? [];
  const agentIds = new Set(
    [...advances, ...deliveries].map((row) => String(row.agent_id ?? "")).filter(Boolean),
  );
  store.agent_balances = [...agentIds].map((agentId) => {
    const advanced = sum(
      advances.filter((row) => row.agent_id === agentId),
      "amount_kobo",
    );
    const spent = sum(
      deliveries.filter((row) => row.agent_id === agentId && row.status === "confirmed"),
      "amount_spent_kobo",
    );
    return {
      agent_id: agentId,
      advanced_kobo: advanced,
      spent_kobo: spent,
      balance_kobo: advanced - spent,
    };
  });

  const movements = store.stock_movements ?? [];
  const warehouseIds = new Set(
    movements.map((row) => String(row.warehouse_id ?? "")).filter(Boolean),
  );
  store.warehouse_stock = [...warehouseIds].map((warehouseId) => {
    const rows = movements.filter((row) => row.warehouse_id === warehouseId);
    const incoming = rows.filter((row) => row.direction === "in");
    const outgoing = rows.filter((row) => row.direction === "out");
    const bagsIn = sum(incoming, "bag_count");
    const bagsOut = sum(outgoing, "bag_count");
    const kgIn = sum(incoming, "total_kg");
    const kgOut = sum(outgoing, "total_kg");
    return {
      warehouse_id: warehouseId,
      bags_in: bagsIn,
      bags_out: bagsOut,
      bags_on_hand: bagsIn - bagsOut,
      kg_in: kgIn,
      kg_out: kgOut,
      kg_on_hand: kgIn - kgOut,
    };
  });

  const investments = store.investments ?? [];
  const returns = store.investor_returns ?? [];
  const withdrawals = store.withdrawal_requests ?? [];
  const investorIds = new Set(
    [...investments, ...returns, ...withdrawals]
      .map((row) => String(row.investor_id ?? ""))
      .filter(Boolean),
  );
  store.investor_positions = [...investorIds].map((investorId) => {
    const capital = sum(
      investments.filter((row) => row.investor_id === investorId),
      "amount_kobo",
    );
    const returnsKobo = sum(
      returns.filter((row) => row.investor_id === investorId),
      "amount_kobo",
    );
    const withdrawn = sum(
      withdrawals.filter(
        (row) =>
          row.investor_id === investorId &&
          ["requested", "approved", "paid"].includes(String(row.status)),
      ),
      "amount_kobo",
    );
    return {
      investor_id: investorId,
      capital_kobo: capital,
      returns_kobo: returnsKobo,
      withdrawn_or_pending_kobo: withdrawn,
      withdrawable_kobo: Math.max(0, returnsKobo - withdrawn),
    };
  });
}

const store = loadStore();
recomputeDerived();
persist();

function matches(row: Row, filters: Filter[]) {
  return filters.every((item) => {
    const current = row[item.field];
    if (item.op === "in") {
      return Array.isArray(item.value) && item.value.includes(current);
    }
    return current === item.value;
  });
}

function rowsFor(table: string, filters: Filter[]) {
  const dataset = store[table] ?? [];
  return dataset.filter((row) => matches(row, filters));
}

function applyWrite(table: string, pending: Pending | null, filters: Filter[]) {
  if (!pending) return;
  if (!store[table]) store[table] = [];
  const now = new Date().toISOString();

  if (pending.type === "insert" || pending.type === "upsert") {
    for (const row of asRows(pending.payload)) {
      if (!row.id) row.id = crypto.randomUUID();
      if (!row.created_at) row.created_at = now;
      row.updated_at = now;
      const index = store[table].findIndex((item) => item.id === row.id);
      if (index >= 0) store[table][index] = { ...store[table][index], ...row };
      else store[table].push(row);
    }
  }

  if (pending.type === "update") {
    store[table] = store[table].map((row) =>
      matches(row, filters) ? { ...row, ...pending.payload, updated_at: now } : row,
    );
  }

  if (pending.type === "delete") {
    store[table] = store[table].filter((row) => !matches(row, filters));
  }

  recomputeDerived();
  persist();
}

function createQuery(table: string) {
  const filters: Filter[] = [];
  let pending: Pending | null = null;
  let sort: { field: string; ascending: boolean } | null = null;

  const snapshot = () => {
    const rows = rowsFor(table, filters);
    const currentSort = sort;
    if (!currentSort) return rows;
    return [...rows].sort((a, b) => {
      const left = String((a as Row)[currentSort.field] ?? "");
      const right = String((b as Row)[currentSort.field] ?? "");
      return currentSort.ascending ? left.localeCompare(right) : right.localeCompare(left);
    });
  };

  const result = (): QueryResult => {
    applyWrite(table, pending, filters);
    pending = null;
    const data = snapshot();
    return { data, error: null, count: data.length };
  };

  const builder: Record<string, unknown> = {};
  const passthrough = () => builder;
  for (const method of [
    "select",
    "is",
    "limit",
    "range",
    "gte",
    "lte",
    "neq",
    "match",
    "filter",
    "not",
    "or",
    "ilike",
    "contains",
  ]) {
    builder[method] = passthrough;
  }
  builder.eq = (field: string, value: unknown) => {
    filters.push({ field, value, op: "eq" });
    return builder;
  };
  builder.in = (field: string, value: unknown) => {
    filters.push({ field, value, op: "in" });
    return builder;
  };
  builder.order = (field: string, options?: { ascending?: boolean }) => {
    sort = { field, ascending: options?.ascending !== false };
    return builder;
  };
  builder.insert = (payload: unknown) => {
    pending = { type: "insert", payload };
    return builder;
  };
  builder.update = (payload: Row) => {
    pending = { type: "update", payload };
    return builder;
  };
  builder.upsert = (payload: unknown) => {
    pending = { type: "upsert", payload };
    return builder;
  };
  builder.delete = () => {
    pending = { type: "delete" };
    return builder;
  };
  builder.maybeSingle = async () => {
    applyWrite(table, pending, filters);
    pending = null;
    const rows = snapshot();
    return { data: rows[0] ?? null, error: null };
  };
  builder.single = async () => {
    applyWrite(table, pending, filters);
    pending = null;
    const rows = snapshot();
    if (!rows[0]) {
      return { data: null, error: { message: "No rows", code: "PGRST116" } };
    }
    return { data: rows[0], error: null };
  };
  builder.then = (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result()).then(resolve, reject);

  return builder;
}

export function createDemoClient(session: DemoAccount | null) {
  const currentSession = () =>
    typeof document !== "undefined" ? readDemoSessionFromDocument() : session;

  return {
    auth: {
      getUser: async () => {
        let active = currentSession();
        if (!active && typeof window !== "undefined") {
          try {
            const response = await fetch("/api/demo/session");
            if (response.ok) {
              const payload = (await response.json()) as { account?: DemoAccount | null };
              if (payload.account) {
                writeDemoSession(payload.account);
                active = payload.account;
              }
            }
          } catch {
            /* stay signed out on the client */
          }
        }
        return {
          data: {
            user: active ? { id: active.id, email: active.email } : null,
          },
          error: null,
        };
      },
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Demo login uses the local demo path.", status: 0 },
      }),
      signOut: async () => {
        clearDemoSession();
        if (typeof window !== "undefined") {
          await fetch("/api/demo/logout", { method: "POST" });
        }
        return { error: null };
      },
      signUp: async () => ({
        data: { user: null, session: null },
        error: { message: "Creating an account is off right now. Sign in instead." },
      }),
      admin: {
        createUser: async () => ({
          data: { user: null },
          error: { message: "Creating people is off right now." },
        }),
      },
    },
    from: (table: string) => createQuery(table),
    channel: () => {
      const channel = {
        on: () => channel,
        subscribe: () => channel,
      };
      return channel;
    },
    removeChannel: async () => undefined,
  };
}
