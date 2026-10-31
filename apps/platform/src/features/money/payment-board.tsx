"use client";

import { Button, Field, Input, Select, StatusBadge } from "@sakwa/ui";
import { deliveryTotalKg, formatNaira, orderLineKobo, pricePerKgKobo } from "@sakwa/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllOrders } from "@/features/orders";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { confirmPayment, listPayments, recordPayment } from "./payments";

export function PaymentBoard() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const payments = useQuery({ queryKey: queryKeys.payments, queryFn: listPayments });
  const orders = useQuery({ queryKey: queryKeys.orders(), queryFn: listAllOrders });

  const payable = (orders.data ?? []).filter(
    (row) => row.status === "placed" && pricePerKgKobo(row) > 0,
  );

  const save = useMutation({
    mutationFn: recordPayment,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.payments });
      await client.invalidateQueries({ queryKey: queryKeys.orders() });
    },
  });

  const confirm = useMutation({
    mutationFn: ({ id, orderId, userId }: { id: string; orderId: string; userId: string }) =>
      confirmPayment(id, orderId, userId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.payments });
      await client.invalidateQueries({ queryKey: queryKeys.orders() });
    },
  });

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const orderId = String(formData.get("orderId") ?? "");
    const amountNaira = Number(formData.get("amount"));
    if (!orderId) {
      setError("Choose an order.");
      return;
    }
    if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
      setError("Enter the amount paid.");
      return;
    }
    await save.mutateAsync({
      orderId,
      amountNaira,
      recordedBy: user.id,
      notes: String(formData.get("notes") ?? ""),
    });
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <section className="lg:col-span-5" aria-label="Record a customer payment">
        <h2 className="mb-4 text-xl font-semibold">Record a payment</h2>
        <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5">
          <Field label="Order" htmlFor="orderId">
            <Select id="orderId" name="orderId" required>
              <option value="">Choose an order with a price</option>
              {payable.map((row) => (
                <option key={row.id} value={row.id}>
                  {deliveryTotalKg(row.bag_count, Number(row.kg_per_bag))} kg · {formatNaira(orderLineKobo(row))}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount in naira" htmlFor="amount">
            <Input id="amount" name="amount" inputMode="numeric" required />
          </Field>
          <Field label="Notes" htmlFor="notes">
            <Input id="notes" name="notes" />
          </Field>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving" : "Record payment"}
          </Button>
        </form>
      </section>
      <section className="lg:col-span-7" aria-label="Payments">
        <h2 className="mb-4 text-xl font-semibold">Payments</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(payments.data ?? []).map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-mono">{formatNaira(row.amount_kobo)}</p>
                <p className="text-sm text-muted">{row.notes || "No note"}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={row.confirmed_at ? "payment_confirmed" : "payment_recorded"} />
                {!row.confirmed_at && user ? (
                  <Button
                    size="sm"
                    type="button"
                    disabled={confirm.isPending}
                    onClick={() =>
                      confirm.mutate({ id: row.id, orderId: row.order_id, userId: user.id })
                    }
                  >
                    Confirm
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
