"use client";

import { Button, Field, Select, StatusBadge } from "@sakwa/ui";
import { deliveryTotalKg } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { listWarehouses } from "@/features/stock";
import { listUsers } from "@/features/users";
import { useAuthUser } from "@/lib/use-auth-user";
import { OwingBoard } from "@/features/balances/owing-board";
import { useAllOrders } from "./use-orders";

function bagsLine(bagCount: number, kgPerBag: number | string) {
  return `${bagCount} bags · ${deliveryTotalKg(bagCount, Number(kgPerBag))} kg`;
}

export function OrderDesk() {
  const { data: user } = useAuthUser();
  const { data, isLoading, approve } = useAllOrders();
  const stores = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
  const people = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));
  const openStores = (stores.data ?? []).filter((row) => row.is_active !== false);
  const orders = data ?? [];
  const waiting = orders.filter((row) => row.status === "placed");
  const gaps = orders.filter(
    (row) =>
      row.status === "delivered" &&
      row.received_bag_count != null &&
      row.released_bag_count != null &&
      row.received_bag_count !== row.released_bag_count,
  );

  return (
    <div className="space-y-8">
      <PageHeading
        mark="orders"
        title="Customer orders"
        body="Approve an order and choose the store that will release it. A difference in bags comes back here."
      />
      {isLoading ? <p className="text-muted">Reading orders.</p> : null}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Waiting for you</h2>
        {waiting.length === 0 ? <p className="text-muted">No order is waiting.</p> : null}
        <ul className="grid gap-3">
          {waiting.map((row) => (
            <li key={row.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {names.get(row.customer_id) ?? "Customer"}
                  </p>
                  <p className="text-sm text-muted">
                    {bagsLine(row.bag_count, row.kg_per_bag)}
                  </p>
                  <p className="text-sm text-muted">{row.delivery_details}</p>
                  <p className="mt-1 text-sm">
                    {row.payment_choice === "paid" ? "Customer says paid" : "Unpaid"}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              <form
                className="mt-4 flex flex-wrap items-end gap-3"
                action={(formData) => {
                  if (!user) return;
                  const warehouseId = String(formData.get("warehouseId") ?? "");
                  if (!warehouseId) return;
                  void approve.mutateAsync({
                    orderId: row.id,
                    warehouseId,
                    approvedBy: user.id,
                  });
                }}
              >
                <Field label="Store to release from" htmlFor={`store-${row.id}`}>
                  <Select id={`store-${row.id}`} name="warehouseId" required>
                    <option value="">Choose a store</option>
                    {openStores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button type="submit" size="sm" disabled={approve.isPending}>
                  Approve and send
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Bag differences</h2>
        {gaps.length === 0 ? (
          <p className="text-muted">No over or under supply is open.</p>
        ) : null}
        <ul className="grid gap-3">
          {gaps.map((row) => {
            const gap = Number(row.received_bag_count) - Number(row.released_bag_count);
            return (
              <li key={row.id} className="rounded-lg border border-border p-4">
                <p className="font-semibold">
                  {names.get(row.customer_id) ?? "Customer"}
                </p>
                <p className="text-sm text-muted">
                  Store sent {row.released_bag_count} bags. Customer received{" "}
                  {row.received_bag_count} bags.
                </p>
                <p className="mt-1 font-semibold">
                  {gap > 0 ? `${gap} bags over` : `${Math.abs(gap)} bags short`}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
      <OwingBoard />
    </div>
  );
}
