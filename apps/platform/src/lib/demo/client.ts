import { DEMO_ACCOUNTS, type DemoAccount } from "./accounts";
import { DEMO_TABLE_DATA } from "./mock-data";

type QueryResult = { data: unknown; error: null; count: number };
type Filter = { field: string; value: unknown; op: "eq" | "in" };

function matches(row: Record<string, unknown>, filters: Filter[]) {
  return filters.every((item) => {
    const current = row[item.field];
    if (item.op === "in") {
      return Array.isArray(item.value) && item.value.includes(current);
    }
    return current === item.value;
  });
}

function rowsFor(table: string, session: DemoAccount | null, filters: Filter[]) {
  if (!session) return [];

  if (table === "profiles") {
    const rows = DEMO_ACCOUNTS.map((account) => ({
      id: account.id,
      full_name: account.fullName,
      email: account.email,
      phone: "08000000000",
      is_active: true,
      primary_role: account.role,
      user_roles: [{ role: account.role }],
    }));
    return rows.filter((row) => matches(row, filters));
  }

  if (table === "user_roles") {
    const rows = DEMO_ACCOUNTS.map((account) => ({
      user_id: account.id,
      role: account.role,
    }));
    return rows.filter((row) => matches(row, filters));
  }

  const dataset = (DEMO_TABLE_DATA[table] as Record<string, unknown>[]) ?? [];
  return dataset.filter((row) => matches(row, filters));
}

function createQuery(table: string, session: DemoAccount | null) {
  const filters: Filter[] = [];

  const result = (): QueryResult => ({
    data: rowsFor(table, session, filters),
    error: null,
    count: rowsFor(table, session, filters).length,
  });

  const builder: Record<string, unknown> = {};
  const passthrough = () => builder;
  for (const method of [
    "select",
    "insert",
    "update",
    "delete",
    "upsert",
    "is",
    "order",
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
  builder.maybeSingle = async () => {
    const rows = rowsFor(table, session, filters);
    return { data: rows[0] ?? null, error: null };
  };
  builder.single = async () => {
    const rows = rowsFor(table, session, filters);
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
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: session ? { id: session.id, email: session.email } : null,
        },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Demo login uses the local demo path.", status: 0 },
      }),
      signOut: async () => {
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
    from: (table: string) => createQuery(table, session),
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
