"use client";

import { Button, Field, Input, StatusBadge } from "@sakwa/ui";
import {
  deliveryTotalKg,
  formatNaira,
  orderLineKobo,
  pricePerKgKobo,
  toLagosDateTime,
} from "@sakwa/utils";
import { useState } from "react";
import { QueryGate } from "@/components/query-gate";
import { notifyRole } from "@/features/notifications/notify";
import { printReceipt } from "@/features/receipts/print-receipt";
import { useAuthUser } from "@/lib/use-auth-user";
import { useCustomerOrders } from "./use-orders";

export function OrderList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError, receive } = useCustomerOrders(user?.id);

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No orders yet"
      emptyBody="Place an order and follow it here until the bags arrive."
    >
      <ul className="grid gap-3">
        {(data ?? []).map((row) => {
          const released = row.released_bag_count;
          const received = row.received_bag_count;
          const gap =
            released != null && received != null
              ? Number(received) - Number(released)
              : null;
          return (
            <li key={row.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {row.bag_count} bags ·{" "}
                    {deliveryTotalKg(row.bag_count, Number(row.kg_per_bag))} kg
                  </p>
                  <p className="text-sm text-muted">{row.delivery_details}</p>
                  <p className="mt-1 text-sm">
                    {row.payment_choice === "paid" ? "Marked paid" : "Unpaid"}
                    {row.status === "approved" ? " · With the store" : ""}
                    {row.status === "dispatched"
                      ? ` · Sent to ${row.released_to || "you"}`
                      : ""}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-3 font-mono text-sm">
                {pricePerKgKobo(row) > 0
                  ? `${formatNaira(pricePerKgKobo(row))} per kg · ${formatNaira(orderLineKobo(row))}`
                  : "Price not set yet"}
              </p>
              {released != null ? (
                <p className="mt-1 text-sm text-muted">Store issued {released} bags.</p>
              ) : null}
              {gap != null && gap !== 0 ? (
                <p className="mt-1 text-sm font-semibold">
                  {gap > 0
                    ? `${gap} bags over what the store sent.`
                    : `${Math.abs(gap)} bags short. The admin has this.`}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {toLagosDateTime(row.created_at)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    printReceipt("Customer order", [
                      { label: "Bags ordered", value: String(row.bag_count) },
                      {
                        label: "Kg",
                        value: String(
                          deliveryTotalKg(row.bag_count, Number(row.kg_per_bag)),
                        ),
                      },
                      {
                        label: "Payment",
                        value: row.payment_choice === "paid" ? "Paid" : "Unpaid",
                      },
                      {
                        label: "Amount",
                        value:
                          pricePerKgKobo(row) > 0
                            ? formatNaira(orderLineKobo(row))
                            : "Price not set",
                      },
                      { label: "Where", value: row.delivery_details },
                      { label: "Status", value: row.status },
                    ])
                  }
                >
                  Receipt
                </Button>
              </div>
              {row.status === "dispatched" ? (
                <ReceiveBags
                  formId={row.id}
                  pending={receive.isPending}
                  onSave={async (count) => {
                    await receive.mutateAsync({
                      orderId: row.id,
                      receivedBagCount: count,
                    });
                    if (released != null && count !== released) {
                      try {
                        await notifyRole("admin", {
                          title: "Bag difference",
                          body: `A customer received ${count} bags. The store issued ${released}.`,
                          kind: "order_variance",
                          entityTable: "orders",
                          entityId: row.id,
                        });
                      } catch {
                        /* The admin desk still lists the gap. */
                      }
                    }
                  }}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </QueryGate>
  );
}

function ReceiveBags({
  formId,
  pending,
  onSave,
}: {
  formId: string;
  pending: boolean;
  onSave: (count: number) => Promise<void>;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 flex flex-wrap items-end gap-3"
      action={(formData) => {
        const count = Number(formData.get("received"));
        if (!Number.isInteger(count) || count < 0) {
          setError("Type the number of bags you received.");
          return;
        }
        setError("");
        void onSave(count);
      }}
    >
      <Field label="Bags you received" htmlFor={`got-${formId}`}>
        <Input id={`got-${formId}`} name="received" inputMode="numeric" required />
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        Confirm delivery
      </Button>
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </form>
  );
}
