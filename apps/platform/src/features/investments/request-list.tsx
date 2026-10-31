"use client";

import { Button, StatusBadge } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryGate } from "@/components/query-gate";
import { ReceiptField, ReceiptView, type ReceiptValue } from "@/components/receipt-field";
import { listUsers } from "@/features/users";
import { HOUSE_BANK } from "@/lib/house-account";
import { queryKeys } from "@/lib/query-keys";
import { InvestmentReviewDialog } from "./investment-review-dialog";
import { useInvestmentRequests } from "./use-requests";

export function InvestmentRequestList({
  investorId,
  mode,
}: {
  investorId?: string;
  mode: "own" | "review";
}) {
  const { data, isLoading, isError, upload } = useInvestmentRequests(investorId);
  const people = useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
    enabled: mode === "review",
  });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No investment requests"
      emptyBody="When an investor asks to put money in, it will wait here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="grid gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-sans font-semibold tabular-nums">{formatNaira(row.amount_kobo)}</p>
                <p className="text-sm text-muted">
                  {mode === "review" ? names.get(row.investor_id) ?? "Investor" : row.notes || "No note"}
                </p>
                {mode === "review" && row.notes ? (
                  <p className="mt-1 text-xs text-muted">{row.notes}</p>
                ) : null}
              </div>
              <StatusBadge status={row.status} />
            </div>

            {mode === "own" && row.status === "accepted" ? (
              <PayInPanel
                amount={formatNaira(row.amount_kobo)}
                pending={upload.isPending}
                onUpload={(receipt) => upload.mutate({ id: row.id, ...receipt })}
              />
            ) : null}

            {row.receipt_url && row.receipt_filename ? (
              <ReceiptView filename={row.receipt_filename} url={row.receipt_url} />
            ) : null}

            {mode === "review" ? <InvestmentReviewDialog row={row} /> : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}

function PayInPanel({
  amount,
  pending,
  onUpload,
}: {
  amount: string;
  pending: boolean;
  onUpload: (receipt: ReceiptValue) => void;
}) {
  const [receipt, setReceipt] = useState<ReceiptValue | null>(null);
  return (
    <div className="rounded-xl border border-border bg-wash p-4">
      <p className="text-base font-semibold">Pay {amount} into the house account</p>
      <p className="mt-1 text-sm text-muted">
        {HOUSE_BANK.accountName} · {HOUSE_BANK.bank} · {HOUSE_BANK.accountNumber}
      </p>
      <div className="mt-4">
        <ReceiptField label="Upload payment receipt" onPicked={setReceipt} />
      </div>
      <Button
        className="mt-4"
        size="sm"
        type="button"
        disabled={!receipt || pending}
        onClick={() => receipt && onUpload(receipt)}
      >
        {pending ? "Sending" : "Send receipt"}
      </Button>
    </div>
  );
}
