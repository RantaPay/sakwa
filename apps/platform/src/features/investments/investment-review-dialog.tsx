"use client";

import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useState } from "react";
import { ReceiptView } from "@/components/receipt-field";
import { houseAccountLines } from "@/lib/house-account";
import { useAuthUser } from "@/lib/use-auth-user";
import { InvestorBrief } from "./investor-brief";
import { useInvestmentRequests } from "./use-requests";

type InvestmentRow = {
  id: string;
  investor_id: string;
  amount_kobo: number;
  notes: string | null;
  status: string;
  receipt_url: string | null;
  receipt_filename: string | null;
};

export function InvestmentReviewDialog({ row }: { row: InvestmentRow }) {
  const { data: user } = useAuthUser();
  const { decide, confirm } = useInvestmentRequests();
  const [reason, setReason] = useState("");
  const canDecide = row.status === "requested" && Boolean(user);
  const canConfirm = row.status === "receipt_sent" && Boolean(user);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button">
          {row.status === "requested" ? "Accept" : "Open"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Investment request {formatNaira(row.amount_kobo)}</DialogTitle>
        <p className="mt-2 text-base text-muted">
          The investor pays the house account and uploads the receipt. You confirm it, and the
          capital goes on the books.
        </p>
        {row.notes ? <p className="mt-2 text-base">{row.notes}</p> : null}
        <InvestorBrief investorId={row.investor_id} />
        <div className="mt-4 rounded-2xl border border-border bg-wash p-4 text-base">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">House account</p>
          {houseAccountLines().map((line) => (
            <p key={line} className="mt-1 font-medium">
              {line}
            </p>
          ))}
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
              onClick={() =>
                decide.mutate({
                  id: row.id,
                  investorId: row.investor_id,
                  amountKobo: row.amount_kobo,
                  status: "accepted",
                  userId: user.id,
                })
              }
            >
              {decide.isPending ? "Sending" : "Accept and send the account"}
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
                decide.mutate({
                  id: row.id,
                  investorId: row.investor_id,
                  amountKobo: row.amount_kobo,
                  status: "rejected",
                  userId: user.id,
                  reason,
                })
              }
            >
              Turn down
            </Button>
          </div>
        ) : null}
        {row.status === "accepted" ? (
          <p className="mt-4 text-base text-muted">
            Waiting for the investor to pay in and upload the receipt.
          </p>
        ) : null}
        {row.status === "approved" || row.status === "confirmed" ? (
          <p className="mt-4 text-base text-muted">This investment is already on the books.</p>
        ) : null}
        {canConfirm && user ? (
          <div className="mt-6">
            <Button
              type="button"
              disabled={confirm.isPending}
              onClick={() =>
                confirm.mutate({
                  id: row.id,
                  investorId: row.investor_id,
                  amountKobo: row.amount_kobo,
                  userId: user.id,
                })
              }
            >
              {confirm.isPending ? "Saving" : "Confirm the money arrived"}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
