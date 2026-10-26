"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useEffect, useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { listTransactions, recordTransaction } from "@/features/transactions";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function TransactionsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listTransactions>>>([]);

  async function refresh() {
    setRows(await listTransactions());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onSubmit(formData: FormData) {
    const supabase = createBrowserSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await recordTransaction({
      direction: String(formData.get("direction")) as "incoming" | "outgoing",
      amountNaira: Number(formData.get("amount")),
      occurredOn: String(formData.get("occurredOn")),
      category: String(formData.get("category")),
      description: String(formData.get("description")),
      recordedBy: data.user.id,
    });
    await refresh();
  }

  return (
    <div>
      <PageHeading title="Other money" body="Any incoming or outgoing amount that is not an order payment or cash given to a field buyer." />
      <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
        <Field label="Direction" htmlFor="direction">
          <select id="direction" name="direction" className="min-h-11 rounded-md border border-border px-3">
            <option value="incoming">In</option>
            <option value="outgoing">Out</option>
          </select>
        </Field>
        <Field label="Amount in naira" htmlFor="amount">
          <Input id="amount" name="amount" inputMode="numeric" required />
        </Field>
        <Field label="Date" htmlFor="occurredOn">
          <Input id="occurredOn" name="occurredOn" type="date" required />
        </Field>
        <Field label="Category" htmlFor="category">
          <Input id="category" name="category" required />
        </Field>
        <Field label="Description" htmlFor="description">
          <Input id="description" name="description" required />
        </Field>
        <Button type="submit">Record</Button>
      </form>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between p-4">
            <p>{row.description}</p>
            <p className="font-mono">{formatNaira(row.amount_kobo)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
