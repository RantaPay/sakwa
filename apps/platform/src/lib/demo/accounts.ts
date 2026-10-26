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
    email: "admin@sakwaagro.com",
    fullName: "Demo Admin",
    role: "admin",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "director@sakwaagro.com",
    fullName: "Demo Director",
    role: "director",
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    email: "accountant@sakwaagro.com",
    fullName: "Demo Accountant",
    role: "accountant",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    email: "store@sakwaagro.com",
    fullName: "Demo Store",
    role: "warehouse",
  },
  {
    id: "a0000000-0000-4000-8000-000000000005",
    email: "buyer@sakwaagro.com",
    fullName: "Demo Field Buyer",
    role: "agent",
  },
  {
    id: "a0000000-0000-4000-8000-000000000006",
    email: "investor@sakwaagro.com",
    fullName: "Demo Investor",
    role: "investor",
  },
  {
    id: "a0000000-0000-4000-8000-000000000007",
    email: "customer@sakwaagro.com",
    fullName: "Demo Customer",
    role: "customer",
  },
];

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function matchDemoAccount(email: string, password: string) {
  if (password !== DEMO_PASSWORD) return null;
  return DEMO_ACCOUNTS.find((row) => row.email === email.trim().toLowerCase()) ?? null;
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
