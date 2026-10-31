"use client";

import { Button, ConfirmDialog, StatusBadge } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { ReceiptView } from "@/components/receipt-field";
import { useAuthUser } from "@/lib/use-auth-user";
import { ProfitReviewDialog } from "./profit-review-dialog";
import { useWithdrawals } from "./use-withdrawals";

export function WithdrawalList({
  investorId,
  mode,
}: {
  investorId?: string;
  mode: "own" | "review" | "pay";
}) {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError, received } = useWithdrawals(investorId);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No profit requests"
      emptyBody="Requests to take out profit will list here."
    >
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(data ?? []).map((row) => (
          <li key={row.id} className="grid gap-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-sans font-semibold tabular-nums">{formatNaira(row.amount_kobo)}</p>
                <p className="text-xs text-muted">Week of {row.cycle_start}</p>
                {row.payout_account_number ? (
                  <p className="mt-1 text-sm text-muted">
                    {row.payout_account_name} · {row.payout_bank_name} · {row.payout_account_number}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={row.status} />
            </div>

            {row.receipt_url && row.receipt_filename ? (
              <ReceiptView filename={row.receipt_filename} url={row.receipt_url} />
            ) : null}

            {mode !== "own" ? <ProfitReviewDialog row={row} mode={mode} /> : null}

            {mode === "own" && row.status === "receipt_sent" && user ? (
              <ConfirmDialog
                title="Confirm you received this"
                body="Only confirm after the money has reached your account."
                confirmLabel="I have received it"
                onConfirm={() => received.mutate({ id: row.id, userId: user.id })}
              >
                <Button size="sm" type="button">
                  Confirm received
                </Button>
              </ConfirmDialog>
            ) : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}


