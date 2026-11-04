import type { Role } from "@sakwa/types";

export type NavItem = { href: string; label: string };

export const ROLE_NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Home" },
    { href: "/admin/accounts", label: "Accounts" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/open/agent_pay", label: "Pay an agent" },
    { href: "/admin/warehouses", label: "Stores" },
    { href: "/admin/open/order_desk", label: "Customer orders" },
    { href: "/admin/users", label: "People" },
    { href: "/admin/permissions", label: "Permissions" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/audit", label: "History" },
    { href: "/admin/profile", label: "Profile" },
  ],
  director: [
    { href: "/director", label: "Home" },
    { href: "/director/agents", label: "Agents" },
    { href: "/director/stores", label: "Stores" },
    { href: "/director/withdrawals", label: "Profit requests" },
    { href: "/director/investments", label: "Investment requests" },
    { href: "/director/enquiries", label: "Enquiries" },
  ],
  accountant: [
    { href: "/accountant", label: "Home" },
    { href: "/accountant/advances", label: "Cash given" },
    { href: "/accountant/orders", label: "Orders" },
    { href: "/accountant/payments", label: "Customer payments" },
    { href: "/accountant/transactions", label: "Other money" },
    { href: "/accountant/investments", label: "Capital" },
    { href: "/accountant/returns", label: "Returns" },
    { href: "/accountant/withdrawals", label: "Profit out" },
    { href: "/accountant/reports", label: "Reports" },
  ],
  warehouse: [
    { href: "/warehouse", label: "Home" },
    { href: "/warehouse/deliveries", label: "Incoming" },
    { href: "/warehouse/releases", label: "Outgoing" },
    { href: "/warehouse/stock", label: "Stock" },
  ],
  agent: [
    { href: "/agent", label: "Home" },
    { href: "/agent/advances", label: "Cash received" },
    { href: "/agent/deliveries", label: "Deliveries" },
  ],
  investor: [
    { href: "/investor", label: "Home" },
    { href: "/investor/returns", label: "Returns" },
    { href: "/investor/withdrawals", label: "Profit out" },
  ],
  customer: [
    { href: "/customer", label: "Home" },
    { href: "/customer/orders", label: "Orders" },
    { href: "/customer/profile", label: "Profile" },
  ],
};
