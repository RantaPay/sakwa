"use client";

import { HandCoins, Scales, Tag } from "@phosphor-icons/react";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { listMarketPrices } from "./market-prices";

function figure(kobo: number | undefined, loading: boolean) {
  if (loading) return "Loading";
  if (!kobo) return "Not set";
  return formatNaira(kobo);
}

function Price({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Tag;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={24} weight="light" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-base text-muted">{label}</p>
        <p className="mt-1 font-mono text-3xl font-semibold tabular-nums sm:text-4xl">{value}</p>
        <p className="mt-1 text-base text-muted">per kg</p>
      </div>
    </div>
  );
}

export function PriceCard() {
  const prices = useQuery({ queryKey: queryKeys.marketPrices, queryFn: listMarketPrices });
  const latest = prices.data?.[0];
  const loading = prices.isLoading;

  return (
    <section aria-label="Buying and selling price">
      <div className="rounded-[1.75rem] border border-border/70 bg-bezel p-1.5">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-surface p-5 shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.85)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
              <span className="size-2 shrink-0 rounded-full bg-accent" />
              Buying and selling price
            </p>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Scales size={24} weight="light" aria-hidden />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Price label="Buying" value={figure(latest?.buying_price_per_kg_kobo, loading)} icon={HandCoins} />
            <Price label="Selling" value={figure(latest?.selling_price_per_kg_kobo, loading)} icon={Tag} />
          </div>
          <p className="mt-4 text-sm text-muted">
            {latest ? `From ${latest.effective_on}.` : "Set in admin settings."}
          </p>
        </div>
      </div>
    </section>
  );
}
