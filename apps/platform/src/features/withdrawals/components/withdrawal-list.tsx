"use client";

import { Button, ConfirmDialog, StatusBadge } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useWithdrawals } from "../hooks/use-withdrawals";

export function WithdrawalList({
  investorId,
  mode,
}: {
  investorId?: string;
  mode: "own" | "review" | "pay";
}) {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError, decide, paid } = useWithdrawals(investorId);

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
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-mono font-semibold">{formatNaira(row.amount_kobo)}</p>
              <p className="text-xs text-muted">Week of {row.cycle_start}</p>
            </div>
            <StatusBadge status={row.status} />
            {mode === "review" && row.status === "requested" && user ? (
              <div className="flex gap-2">
                <ConfirmDialog
                  title="Approve this request"
                  body="The investor can then be paid offline."
                  confirmLabel="Approve"
                  onConfirm={() =>
                    decide.mutate({ id: row.id, status: "approved", userId: user.id })
                  }
                >
                  <Button size="sm" type="button">
                    Approve
                  </Button>
                </ConfirmDialog>
                <ConfirmDialog
                  title="Turn this request down"
                  body="The investor will see this as turned down."
                  confirmLabel="Turn down"
                  tone="danger"
                  onConfirm={() => {
                    const reason = window.prompt("Reason") ?? "";
                    decide.mutate({
                      id: row.id,
                      status: "rejected",
                      userId: user.id,
                      reason,
                    });
                  }}
                >
                  <Button size="sm" variant="danger" type="button">
                    Turn down
                  </Button>
                </ConfirmDialog>
              </div>
            ) : null}
            {mode === "pay" && row.status === "approved" && user ? (
              <ConfirmDialog
                title="Mark as paid"
                body="Only do this after the money has gone out offline."
                confirmLabel="Mark paid"
                onConfirm={() => paid.mutate({ id: row.id, userId: user.id })}
              >
                <Button size="sm" type="button">
                  Mark paid
                </Button>
              </ConfirmDialog>
            ) : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
