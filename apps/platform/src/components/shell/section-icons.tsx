"use client";

import { createElement } from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowLineDown,
  ArrowLineUp,
  ArrowsLeftRight,
  Bank,
  Bell,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartLineUp,
  ChatCircle,
  ClipboardText,
  ClockCounterClockwise,
  Coins,
  CurrencyNgn,
  Gear,
  Grains,
  HandCoins,
  Handshake,
  House,
  MoneyWavy,
  Package,
  Percent,
  PiggyBank,
  Plant,
  Receipt,
  Scales,
  SealPercent,
  ShoppingBag,
  SlidersHorizontal,
  SquaresFour,
  Storefront,
  Tag,
  TrendUp,
  Truck,
  User,
  UsersThree,
  Wallet,
  Warehouse,
} from "@phosphor-icons/react";
import { cn } from "@sakwa/ui/cn";

const MARKS: Record<string, Icon> = {
  trade: ChartLine,
  trade_store: ChartLineUp,
  buying_price: Scales,
  cash_given: HandCoins,
  cash_received: Wallet,
  deliveries: Truck,
  field_buyers: UsersThree,
  stores: Storefront,
  incoming: ArrowLineDown,
  outgoing: ArrowLineUp,
  stock: Package,
  orders: ClipboardText,
  customer_payments: Receipt,
  customer_orders: ShoppingBag,
  other_money: ArrowsLeftRight,
  reports: ChartBar,
  analytics: ChartPie,
  capital_requests: Handshake,
  ask_to_invest: Bank,
  capital: PiggyBank,
  profit_requests: Coins,
  profit_pay: CurrencyNgn,
  investor_profit: MoneyWavy,
  returns_desk: SealPercent,
  investor_returns: Percent,
  enquiries: ChatCircle,
  profile: User,
  people: UsersThree,
  permissions: SlidersHorizontal,
  settings: Gear,
  history: ClockCounterClockwise,
  home: House,
  notices: Bell,
  brand: Grains,
  weekly_interest: Percent,
};

const GROUPS: Record<string, Icon> = {
  "Field buying": Plant,
  Stores: Warehouse,
  Selling: ShoppingBag,
  Money: Coins,
  Investors: Bank,
  Account: User,
};

const STATS: Record<string, Icon> = {
  People: UsersThree,
  Stores: Storefront,
  "Money in": ArrowLineDown,
  "Money out": ArrowLineUp,
  Result: TrendUp,
  "Bags on hand": Package,
  "Cash in the field": Wallet,
  Incoming: ArrowLineDown,
  "Profit waiting": Coins,
  "Investment requests": Handshake,
  "Capital waiting": Handshake,
  "On hand": Package,
  "Taken in": ArrowLineDown,
  "Sent out": ArrowLineUp,
  "Cash with you": Wallet,
  "You added your own money": HandCoins,
  Even: Scales,
  "Cash given": HandCoins,
  "Buying per kg": Tag,
  "Capital in": PiggyBank,
  "Returns to date": Percent,
  "Profit you can take": Coins,
  "Open orders": ShoppingBag,
  "All orders": ClipboardText,
};

const ADMIN_HREF: Record<string, Icon> = {
  "/admin/analytics": ChartPie,
  "/admin/users": UsersThree,
  "/admin/warehouses": Storefront,
  "/admin/permissions": SlidersHorizontal,
  "/admin/settings": Gear,
  "/admin/audit": ClockCounterClockwise,
  "/admin/profile": User,
};

const ROLE_HOME = /^\/(admin|director|accountant|warehouse|agent|investor|customer)\/?$/;

export function iconForMark(mark: string): Icon {
  return MARKS[mark] ?? SquaresFour;
}

export function iconForHref(href: string): Icon {
  const open = href.match(/\/open\/([a-z0-9_-]+)/);
  const feature = open?.[1] ? MARKS[open[1]] : undefined;
  if (feature) return feature;
  const admin = ADMIN_HREF[href];
  if (admin) return admin;
  if (ROLE_HOME.test(href)) return House;
  return SquaresFour;
}

export function iconForStat(label: string): Icon | null {
  return STATS[label] ?? null;
}

export function iconForGroup(group: string): Icon {
  return GROUPS[group] ?? SquaresFour;
}

export function SectionMark({
  mark,
  size = 26,
  className,
}: {
  mark: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary",
        className,
      )}
    >
      {createElement(iconForMark(mark), { size, weight: "light", "aria-hidden": true })}
    </span>
  );
}
