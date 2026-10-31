"use client";

import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useState } from "react";
import { ReceiptField, ReceiptView, type ReceiptValue } from "@/components/receipt-field";
import { InvestorBrief } from "@/features/investments/investor-brief";
import { useAuthUser } from "@/lib/use-auth-user";
import { useWithdrawals } from "./use-withdrawals";

type ProfitRow = {
  id: string;
  investor_id: string;
  amount_kobo: number;
  cycle_start: string;
  status: string;
  payout_account_name: string | null;
  payout_bank_name: string | null;
  payout_account_number: string | null;
  receipt_url: string | null;
  receipt_filename: string | null;
};

export function ProfitReviewDialog({
  row,
  mode,
}: {
  row: ProfitRow;
  mode: "review" | "pay";
}) {
  const { data: user } = useAuthUser();
  const { decide, upload } = useWithdrawals();
  const [reason, setReason] = useState("");
  const [receipt, setReceipt] = useState<ReceiptValue | null>(null);
  const account = [row.payout_account_name, row.payout_bank_name, row.payout_account_number]
    .filter(Boolean)
    .join(" · ");
  const canDecide = mode === "review" && row.status === "requested" && Boolean(user);
  const canPay =
    (mode === "review" || mode === "pay") &&
    (row.status === "accepted" || row.status === "approved") &&
    Boolean(user);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          {row.status === "requested" && mode === "review" ? "Accept" : "Open"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Profit request {formatNaira(row.amount_kobo)}</DialogTitle>
        <p className="mt-2 text-base text-muted">
          Week of {row.cycle_start}. Check the investor, then send the money and upload the receipt.
          They confirm when it lands.
        </p>
        <InvestorBrief investorId={row.investor_id} />
        <div className="mt-4 rounded-2xl border border-border bg-wash p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Pay this request to</p>
          <p className="mt-1 text-base font-medium">{account || "No account was saved on this request."}</p>
        </div>
        {row.receipt_url && row.receipt_filename ? (
          <div className="mt-4">
            <ReceiptView filename={row.receipt_filename} url={row.receipt_url} />
          </div>
        ) : null}
        {canDecide && user ? (
          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              disabled={decide.isPending}
              onClick={() => decide.mutate({ id: row.id, status: "accepted", userId: user.id })}
            >
              {decide.isPending ? "Saving" : "Accept and send word"}
            </Button>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason, if you turn it down"
              aria-label="Reason"
            />
            <Button
              type="button"
              variant="danger"
              disabled={decide.isPending}
              onClick={() =>
                decide.mutate({ id: row.id, status: "rejected", userId: user.id, reason })
              }
            >
              Turn down
            </Button>
          </div>
        ) : null}
        {canPay && user ? (
          <div className="mt-6 grid gap-3">
            <p className="text-base font-semibold">Upload the transfer receipt</p>
            <ReceiptField label="Payout receipt" onPicked={setReceipt} />
            <Button
              type="button"
              disabled={!receipt || upload.isPending}
              onClick={() => receipt && upload.mutate({ id: row.id, userId: user.id, ...receipt })}
            >
              {upload.isPending ? "Sending" : "Send receipt to the investor"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
