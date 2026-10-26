"use client";

import { Button, Field, Input, StatusBadge } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { confirmPayment, listPayments, recordPayment } from "@/features/payments";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function PaymentsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listPayments>>>([]);

  async function refresh() {
    setRows(await listPayments());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSubmit(formData: FormData) {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await recordPayment({
      orderId: String(formData.get("orderId")),
      amountNaira: Number(formData.get("amount")),
      recordedBy: data.user.id,
    });
    await refresh();
  }

  return (
    <div>
      <PageHeading title="Customer payments" body="Write in a payment, then confirm it before rice is released." />
      <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
        <Field label="Order id" htmlFor="orderId">
          <Input id="orderId" name="orderId" required />
        </Field>
        <Field label="Amount in naira" htmlFor="amount">
          <Input id="amount" name="amount" inputMode="numeric" required />
        </Field>
        <Button type="submit">Record payment</Button>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="font-mono">{formatNaira(row.amount_kobo)}</p>
            <StatusBadge status={row.confirmed_at ? "payment_confirmed" : "payment_recorded"} />
            {!row.confirmed_at ? (
              <Button
                size="sm"
                type="button"
                onClick={async () => {
                  const supabase = createBrowserSupabase();
                  const { data } = await supabase.auth.getUser();
                  if (!data.user) return;
                  await confirmPayment(row.id, row.order_id, data.user.id);
                  await refresh();
                }}
              >
                Confirm
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
