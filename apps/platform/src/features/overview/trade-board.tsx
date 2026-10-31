"use client";

import { ChartLine, Coins, TrendDown, TrendUp, Wallet } from "@phosphor-icons/react";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@sakwa/ui";
import { queryKeys } from "@/lib/query-keys";
import { loadTradeBooks } from "./trade";

function ratio(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(1, Math.max(0, part / whole));
}

function Figure({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
  tone?: "primary" | "danger";
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          tone === "danger" ? "bg-danger/10 text-danger" : "bg-primary-soft text-primary",
        )}
      >
        <Icon size={24} weight="light" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
        <p
          className={cn(
            "mt-1 font-sans text-4xl font-semibold tabular-nums tracking-tight",
            tone === "danger" ? "text-danger" : "text-foreground",
          )}
        >
          {value}
        </p>
        <p className="mt-1 text-sm text-muted">{hint}</p>
      </div>
    </div>
  );
}

function Meter({ label, amount, scale, bar }: { label: string; amount: string; scale: number; bar: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-sans tabular-nums text-foreground">{amount}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bezel">
        <div
          className={cn("h-full w-full rounded-full", bar)}
          style={{ transform: `scaleX(${scale})`, transformOrigin: "left center" }}
        />
      </div>
    </div>
  );
}

export function TradeBoard({
  warehouseIds,
  title = "Expense / interest",
}: {
  warehouseIds?: string[];
  title?: string;
}) {
  const books = useQuery({
    queryKey: queryKeys.tradeBooks(warehouseIds),
    queryFn: () => loadTradeBooks(warehouseIds),
  });
  const data = books.data;
  const spent = data?.spentKobo ?? 0;
  const sold = data?.soldKobo ?? 0;
  const interest = data?.interestKobo ?? 0;
  const ahead = Math.max(spent, sold, 1);
  const maxStore = Math.max(1, ...(data?.stores.map((row) => Math.max(row.spentKobo, row.soldKobo)) ?? [1]));
  const InterestIcon = interest < 0 ? TrendDown : TrendUp;
  const interestTone = interest < 0 ? "danger" : "primary";

  return (
    <section className="mb-10" aria-label={title}>
      <div className="rounded-[1.75rem] border border-border/70 bg-bezel p-1.5">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-surface p-5 shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.85)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <span className="size-2 shrink-0 rounded-full bg-accent" />
                {title}
              </p>
              <p className="mt-2 max-w-prose text-base text-muted">
                Expense is the kilograms bought times the buying price for that day. Sales is the kilograms
                sold times the selling price for that day. Interest is sales minus expense.
              </p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ChartLine size={24} weight="light" aria-hidden />
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Figure
              label="Expense"
              value={formatNaira(spent)}
              hint={`${data?.bagsBought ?? 0} bags bought · ${data?.kgBought ?? 0} kg`}
              icon={Wallet}
            />
            <Figure
              label="Sold to customers"
              value={formatNaira(sold)}
              hint={`${data?.bagsSold ?? 0} bags sold · ${data?.kgSold ?? 0} kg`}
              icon={Coins}
            />
            <Figure
              label="Interest"
              value={formatNaira(interest)}
              hint={
                !data?.priced
                  ? "Set the buying and selling price to turn the bags into naira."
                  : interest < 0
                    ? "More was bought than has been sold. The rest is still in store."
                    : "Sales are above the cost of what was bought."
              }
              icon={InterestIcon}
              tone={interestTone}
            />
          </div>

          <div className="mt-8 rounded-[1.25rem] bg-wash p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Sales against expense
            </p>
            <div className="mt-4 grid gap-3">
              <Meter label="Expense" amount={formatNaira(spent)} scale={ratio(spent, ahead)} bar="bg-primary" />
              <Meter label="Sales" amount={formatNaira(sold)} scale={ratio(sold, ahead)} bar="bg-accent" />
            </div>
            <p className="mt-3 text-sm text-muted">
              The longer bar is ahead. Interest is the gap between sales and expense.
            </p>
          </div>

          <ul className="mt-8 space-y-5">
            {(data?.stores ?? []).length === 0 ? (
              <li className="text-base text-muted">No confirmed bags or paid orders yet.</li>
            ) : (
              (data?.stores ?? []).map((row) => (
                <li key={row.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 text-base">
                    <span className="font-semibold">{row.name}</span>
                    <span className="font-sans tabular-nums text-muted">
                      Expense {formatNaira(row.spentKobo)} · Sold {formatNaira(row.soldKobo)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-bezel">
                      <div
                        className="h-full w-full rounded-full bg-primary"
                        style={{
                          transform: `scaleX(${row.spentKobo / maxStore})`,
                          transformOrigin: "left center",
                        }}
                      />
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bezel">
                      <div
                        className="h-full w-full rounded-full bg-accent"
                        style={{
                          transform: `scaleX(${row.soldKobo / maxStore})`,
                          transformOrigin: "left center",
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
