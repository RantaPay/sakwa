"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { transactionSchema } from "@sakwa/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { listTransactions, recordTransaction } from "./transactions";

export function TransactionBoard() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const rows = useQuery({ queryKey: queryKeys.transactions, queryFn: listTransactions });

  const save = useMutation({
    mutationFn: recordTransaction,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = transactionSchema.omit({ id: true }).safeParse({
      direction: String(formData.get("direction")),
      amountNaira: Number(formData.get("amount")),
      occurredOn: String(formData.get("occurredOn") ?? ""),
      category: String(formData.get("category") ?? ""),
      description: String(formData.get("description") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await save.mutateAsync({ ...parsed.data, recordedBy: user.id });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <section className="lg:col-span-5" aria-label="Record other money">
        <h2 className="mb-4 text-xl font-semibold">Record other money</h2>
        <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5">
          <Field label="Direction" htmlFor="direction">
            <select
              id="direction"
              name="direction"
              className="min-h-11 w-full rounded-md border border-border px-3"
            >
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
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving" : "Record"}
          </Button>
        </form>
      </section>
      <section className="lg:col-span-7" aria-label="Other money">
        <h2 className="mb-4 text-xl font-semibold">Recent entries</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(rows.data ?? []).map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p>{row.description}</p>
                <p className="text-sm text-muted">
                  {row.direction === "incoming" ? "In" : "Out"} · {row.category}
                </p>
              </div>
              <p className="font-mono">{formatNaira(row.amount_kobo)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
