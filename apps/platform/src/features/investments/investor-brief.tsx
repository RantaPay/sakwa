"use client";

import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";
import { listInvestments } from "./investments";
import { usePosition } from "./use-investments";

export function InvestorBrief({ investorId }: { investorId: string }) {
  const profile = useQuery({
    queryKey: queryKeys.profile(investorId),
    queryFn: () => getProfile(investorId),
  });
  const investments = useQuery({
    queryKey: queryKeys.investments(investorId),
    queryFn: () => listInvestments(investorId),
  });
  const position = usePosition(investorId);
  const person = profile.data;
  const bank = [person?.account_name, person?.bank_name, person?.account_number].filter(Boolean);

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-wash p-4">
        {person?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.avatar_url}
            alt=""
            className="size-14 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-base font-semibold text-primary">
            {(person?.full_name ?? "Investor").slice(0, 1)}
          </span>
        )}
        <div>
          <p className="text-lg font-semibold">{person?.full_name ?? "Investor"}</p>
          <p className="text-sm text-muted">{person?.phone || "No phone yet"}</p>
          <p className="text-sm text-muted">{person?.email}</p>
          {bank.length > 0 ? <p className="mt-1 text-sm">{bank.join(" · ")}</p> : null}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <figure className="rounded-2xl border border-border p-3">
          <figcaption className="text-xs uppercase tracking-[0.14em] text-muted">Capital in</figcaption>
          <p className="mt-1 font-semibold tabular-nums">{formatNaira(position.data?.capital_kobo ?? 0)}</p>
        </figure>
        <figure className="rounded-2xl border border-border p-3">
          <figcaption className="text-xs uppercase tracking-[0.14em] text-muted">Returns</figcaption>
          <p className="mt-1 font-semibold tabular-nums">{formatNaira(position.data?.returns_kobo ?? 0)}</p>
        </figure>
        <figure className="rounded-2xl border border-border p-3">
          <figcaption className="text-xs uppercase tracking-[0.14em] text-muted">Can take</figcaption>
          <p className="mt-1 font-semibold tabular-nums">
            {formatNaira(position.data?.withdrawable_kobo ?? 0)}
          </p>
        </figure>
      </div>
      <div className="rounded-2xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Investments</p>
        {(investments.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted">No capital on the books yet.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {(investments.data ?? []).map((row) => (
              <li key={row.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{row.invested_on}</span>
                <span className="font-semibold tabular-nums">{formatNaira(row.amount_kobo)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
