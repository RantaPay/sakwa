"use client";

import type { ReactNode } from "react";
import {
  ArrowLineDown,
  ArrowLineUp,
  ArrowUpRight,
  Bag,
  ClockCounterClockwise,
  Coins,
  Grains,
  Handshake,
  PiggyBank,
  Storefront,
  Truck,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@sakwa/ui";
import { queryKeys } from "@/lib/query-keys";
import { describeAudit } from "./audit-copy";
import { loadSystemSnapshot } from "./snapshot";

function Shell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-[1.75rem] border border-border/70 bg-bezel p-1.5", className)}>
      <div className="flex h-full min-h-[13.5rem] flex-col rounded-[calc(1.75rem-0.375rem)] bg-surface p-6 shadow-[inset_0_1px_1px_rgb(255_255_255_/_0.85)] sm:p-7">
        {children}
      </div>
    </div>
  );
}

function Mark({ icon: Icon }: { icon: typeof Bag }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
      <Icon size={24} weight="light" aria-hidden />
    </span>
  );
}

function Tile({
  href,
  label,
  value,
  hint,
  icon: Icon,
  gold = false,
}: {
  href?: string;
  label: string;
  value: string;
  hint?: string;
  icon: typeof Bag;
  gold?: boolean;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon size={24} weight="light" />
        </span>
        {href ? (
          <span className="flex size-10 items-center justify-center rounded-full bg-bezel text-muted">
            <ArrowUpRight size={18} weight="bold" />
          </span>
        ) : null}
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {gold ? <span className="size-2 shrink-0 rounded-full bg-accent" /> : null}
        {label}
      </p>
      <p className="mt-1 min-w-0 truncate font-sans text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-auto pt-2 text-sm text-muted">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex h-full flex-col rounded-[1.25rem] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.99]"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export function OverviewBoard() {
  const snapshot = useQuery({
    queryKey: queryKeys.systemSnapshot,
    queryFn: loadSystemSnapshot,
  });
  const data = snapshot.data;
  const names = new Map((data?.personNames ?? []).map((person) => [person.id, person.name]));
  const maxBags = Math.max(1, ...(data?.storeRows.map((row) => row.bags) ?? [1]));

  return (
    <div className="space-y-4 xl:space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        <Shell className="rise">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Rice on hand</p>
            <Mark icon={Grains} />
          </div>
          <p className="mt-3 font-sans text-6xl font-semibold tabular-nums tracking-tight">
            {data?.bagsOnHand ?? "—"}
          </p>
          <p className="mt-2 text-base text-muted">bags across every store</p>
          <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-start gap-2">
              <ArrowLineDown size={20} weight="light" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Taken in</p>
                <p className="mt-1 font-sans text-xl font-semibold tabular-nums">{data?.bagsIn ?? 0}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowLineUp size={20} weight="light" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Sent out</p>
                <p className="mt-1 font-sans text-xl font-semibold tabular-nums">{data?.bagsOut ?? 0}</p>
              </div>
            </div>
          </div>
        </Shell>
        <Shell className="rise rise-delay-1">
          <Tile
            label="Cash with agents"
            value={formatNaira(data?.cashWithBuyers ?? 0)}
            hint="Still in the field"
            icon={Wallet}
            gold
          />
        </Shell>
        <Shell className="rise rise-delay-1">
          <Tile
            label="Incoming to confirm"
            value={`${data?.pendingDeliveries ?? 0}`}
            hint="Bags waiting at a store"
            icon={Truck}
          />
        </Shell>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        <Shell className="rise rise-delay-2">
          <Tile
            label="Open orders"
            value={`${data?.openOrders ?? 0}`}
            hint={`${data?.paidWaitingRelease ?? 0} ready to leave the store`}
            icon={Bag}
          />
        </Shell>
        <Shell className="rise rise-delay-2">
          <Tile
            label="Profit requests"
            value={`${data?.profitWaiting ?? 0}`}
            hint="Waiting on a decision"
            icon={Coins}
          />
        </Shell>
        <Shell className="rise rise-delay-2 sm:col-span-2 xl:col-span-1">
          <Tile
            label="Investment requests"
            value={`${data?.capitalWaiting ?? 0}`}
            hint="Investors waiting on the director"
            icon={Handshake}
          />
        </Shell>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
        <Shell className="rise rise-delay-3 xl:col-span-8">
          <div className="flex items-center gap-3">
            <Mark icon={Coins} />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Money on the books</p>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <ArrowLineDown size={20} weight="light" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm text-muted">In</p>
                <p className="mt-1 font-sans text-3xl font-semibold tabular-nums">
                  {formatNaira(data?.moneyIn ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowLineUp size={20} weight="light" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm text-muted">Out</p>
                <p className="mt-1 font-sans text-3xl font-semibold tabular-nums">
                  {formatNaira(data?.moneyOut ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <PiggyBank size={20} weight="light" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm text-muted">Capital in</p>
                <p className="mt-1 font-sans text-3xl font-semibold tabular-nums">
                  {formatNaira(data?.capitalIn ?? 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex h-3 overflow-hidden rounded-full bg-bezel">
            {(() => {
              const inn = data?.moneyIn ?? 0;
              const out = data?.moneyOut ?? 0;
              const total = Math.max(1, inn + out);
              return (
                <>
                  <span className="h-full bg-primary" style={{ width: `${(inn / total) * 100}%` }} />
                  <span className="h-full bg-accent" style={{ width: `${(out / total) * 100}%` }} />
                </>
              );
            })()}
          </div>
          <p className="mt-2 text-sm text-muted">Green is money in. Gold is money out.</p>
        </Shell>
        <Shell className="rise rise-delay-3 xl:col-span-4">
          <Tile href="/admin/users" label="People" value={`${data?.people ?? 0}`} icon={UsersThree} />
          <div className="my-5 h-px bg-border" />
          <Tile href="/admin/warehouses" label="Stores" value={`${data?.stores ?? 0}`} icon={Storefront} />
        </Shell>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5">
        <Shell className="rise xl:col-span-7">
          <div className="flex items-center gap-3">
            <Mark icon={Storefront} />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Stock by store</p>
          </div>
          <ul className="mt-5 space-y-4">
            {(data?.storeRows ?? []).length === 0 ? (
              <li className="text-base text-muted">No bags on the books yet.</li>
            ) : (
              (data?.storeRows ?? []).map((row) => (
                <li key={row.id}>
                  <div className="flex items-baseline justify-between gap-3 text-base">
                    <span className="font-semibold">{row.name}</span>
                    <span className="font-sans tabular-nums">{row.bags} bags</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bezel">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        transform: `scaleX(${row.bags / maxBags})`,
                        transformOrigin: "left center",
                      }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </Shell>
        <Shell className="rise xl:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mark icon={ClockCounterClockwise} />
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Recent history</p>
            </div>
            <a
              href="/admin/audit"
              className="text-sm font-semibold text-primary transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-0.5"
            >
              See all
            </a>
          </div>
          <ul className="mt-5 grid gap-2">
            {(data?.audit ?? []).length === 0 ? (
              <li className="text-base text-muted">No history yet.</li>
            ) : (
              (data?.audit ?? []).map((row) => {
                const copy = describeAudit(row, names);
                return (
                  <li key={row.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                      {new Date(row.created_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}
                    </p>
                    <p className="mt-1 font-semibold">{copy.title}</p>
                    <p className="mt-1 text-sm text-muted">{copy.detail}</p>
                  </li>
                );
              })
            )}
          </ul>
        </Shell>
      </div>
    </div>
  );
}
