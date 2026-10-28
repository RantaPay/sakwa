import type { Role } from "@sakwa/types";

export const DEMO_PASSWORD = "SakwaDemo2026!";
export const DEMO_COOKIE = "sakwa-demo-session";

export type DemoAccount = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    email: "admin@gmail.com",
    fullName: "Demo Admin",
    role: "admin",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "director@gmail.com",
    fullName: "Demo Director",
    role: "director",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    email: "accountant@gmail.com",
    fullName: "Demo Accountant",
    role: "accountant",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    email: "store@gmail.com",
    fullName: "Demo Store",
    role: "warehouse",
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    email: "agent@gmail.com",
    fullName: "Demo Agent",
    role: "agent",
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    email: "investor@gmail.com",
    fullName: "Demo Investor",
    role: "investor",
  },
  {
    id: "a0000000-0000-4000-8000-000000000007",
    email: "customer@gmail.com",
    fullName: "Demo Customer",
    role: "customer",
  },
];

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function matchDemoAccount(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Normalize email: allow entering role name directly (e.g. "agent" -> "agent@gmail.com")
  const normalizedEmail = cleanEmail.includes("@") ? cleanEmail : `${cleanEmail}@gmail.com`;

  // Find matching account (supporting both @gmail.com and legacy @sakwaagro.com)
  const account =
    DEMO_ACCOUNTS.find((row) => row.email === normalizedEmail) ??
    DEMO_ACCOUNTS.find((row) => row.email === cleanEmail) ??
    (normalizedEmail === "warehouse@gmail.com" || normalizedEmail === "store@gmail.com"
      ? DEMO_ACCOUNTS.find((row) => row.role === "warehouse")
      : null) ??
    (normalizedEmail === "buyer@gmail.com" || normalizedEmail === "agent@gmail.com"
      ? DEMO_ACCOUNTS.find((row) => row.role === "agent")
      : null) ??
    DEMO_ACCOUNTS.find(
      (row) => row.email.replace("@gmail.com", "@sakwaagro.com") === cleanEmail,
    );

  if (!account) return null;

  // Allowed passwords:
  // - Role name itself (e.g. "agent", "director", "admin", "accountant", "investor", "customer")
  // - Email username (e.g. "store" or "warehouse")
  // - Legacy DEMO_PASSWORD
  const allowedPasswords = new Set([
    account.role,
    account.email.split("@")[0],
    DEMO_PASSWORD,
    ...(account.role === "warehouse" ? ["store", "warehouse"] : []),
    ...(account.role === "agent" ? ["buyer", "agent"] : []),
  ]);

  if (!allowedPasswords.has(cleanPassword)) {
    return null;
  }

  return account;
}

export function parseDemoCookie(value: string | undefined): DemoAccount | null {
  if (!value) return null;
  const tryParse = (raw: string) => {
    const parsed = JSON.parse(raw) as DemoAccount;
    return DEMO_ACCOUNTS.find((row) => row.id === parsed.id) ?? null;
  };
  try {
    return tryParse(decodeURIComponent(value));
  } catch {
    try {
      return tryParse(value);
    } catch {
      return null;
    }
  }
}

export function encodeDemoCookie(account: DemoAccount) {
  return encodeURIComponent(JSON.stringify(account));
}
