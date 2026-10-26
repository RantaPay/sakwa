export const ROLES = [
  "admin",
  "director",
  "accountant",
  "warehouse",
  "agent",
  "investor",
  "customer",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  director: "/director",
  accountant: "/accountant",
  warehouse: "/warehouse",
  agent: "/agent",
  investor: "/investor",
  customer: "/customer",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  director: "Director",
  accountant: "Accountant",
  warehouse: "Store",
  agent: "Field buyer",
  investor: "Investor",
  customer: "Customer",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
