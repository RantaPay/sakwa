"use client";

import {
  bookDay,
  deliveryTotalKg,
  formatNaira,
  lineTotalKobo,
  priceForDay,
} from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { figureText, useFigures } from "@/features/money/figures";
import { listMarketPrices } from "@/features/prices/market-prices";
import { listUsers } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";
import { loadTradeBooks } from "./trade";

function perKg(totalKobo: number, kg: number) {
  if (kg <= 0) return 0;
  return Math.round(totalKobo / kg);
}

export function ExpensePanel() {
  const { hidden } = useFigures();
  const books = useQuery({
    queryKey: queryKeys.tradeBooks(),
    queryFn: () => loadTradeBooks(),
  });
  const deliveries = useQuery({
    queryKey: queryKeys.deliveries(),
    queryFn: listWarehouseDeliveries,
  });
  const rates = useQuery({ queryKey: queryKeys.marketPrices, queryFn: listMarketPrices });
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));
  const show = (value: string) => figureText(value, hidden);
  const spent = books.data?.spentKobo ?? 0;
  const interest = books.data?.interestKobo ?? 0;
  const kgBought = books.data?.kgBought ?? 0;
  const kgSold = books.data?.kgSold ?? 0;

  const lines = (deliveries.data ?? []).filter((row) => row.status === "confirmed");

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Expense and interest</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <p>
          <span className="block text-sm text-muted">Expense per kg</span>
          <span className="font-mono text-2xl font-semibold">
            {show(formatNaira(perKg(spent, kgBought)))}
          </span>
        </p>
        <p>
          <span className="block text-sm text-muted">Interest per kg</span>
          <span className="font-mono text-2xl font-semibold">
            {show(formatNaira(perKg(interest, kgSold)))}
          </span>
        </p>
      </div>
      <h3 className="text-lg font-semibold">Expense breakdown</h3>
      {lines.length === 0 ? <p className="text-muted">No confirmed supply yet.</p> : null}
      <ul className="divide-y divide-border">
        {lines.map((row) => {
          const price = priceForDay(rates.data ?? [], bookDay(row.delivered_on));
          const kg = deliveryTotalKg(Number(row.bag_count), Number(row.kg_per_bag));
          const amount = lineTotalKobo(
            price?.buying_price_per_kg_kobo ?? 0,
            Number(row.bag_count),
            row.kg_per_bag,
          );
          return (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-semibold">{names.get(row.agent_id) ?? "Agent"}</p>
                <p className="text-sm text-muted">
                  {row.bag_count} bags · {kg} kg
                  {Number(row.bags_damaged ?? 0) > 0
                    ? ` · ${row.bags_damaged} damaged`
                    : ""}
                </p>
              </div>
              <p className="font-mono">{show(formatNaira(amount))}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
