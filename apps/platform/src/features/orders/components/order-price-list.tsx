"use client";

import { Button, Field, Input, Select, StatusBadge } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { QueryGate } from "@/components/query-gate";
import { listWarehouses } from "@/features/warehouses";
import { useAllOrders } from "../hooks/use-orders";

export function OrderPriceList() {
  const { data, isLoading, isError, price, status } = useAllOrders();
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No orders"
      emptyBody="When a customer places an order, set the price here."
    >
      <ul className="grid gap-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.bag_count} bags · {row.kg_per_bag} kg
                </p>
                <p className="text-sm text-muted">{row.delivery_details}</p>
                <p className="mt-1 font-mono text-sm">
                  {row.price_per_bag_kobo > 0
                    ? formatNaira(row.price_per_bag_kobo)
                    : "No price yet"}
                </p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.status === "placed" ? (
              <form
                className="mt-4 grid gap-3 md:grid-cols-3"
                action={(formData) => {
                  void price.mutateAsync({
                    orderId: row.id,
                    pricePerBagNaira: Number(formData.get("price")),
                    warehouseId: String(formData.get("warehouseId") || "") || undefined,
                  });
                }}
              >
                <Field label="Price per bag" htmlFor={`price-${row.id}`}>
                  <Input id={`price-${row.id}`} name="price" inputMode="numeric" required />
                </Field>
                <Field label="Store" htmlFor={`wh-${row.id}`}>
                  <Select id={`wh-${row.id}`} name="warehouseId">
                    <option value="">Choose later</option>
                    {(warehouses.data ?? []).map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="flex items-end">
                  <Button type="submit" size="sm">
                    Save price
                  </Button>
                </div>
              </form>
            ) : null}
            {row.status === "payment_confirmed" ? (
              <Button
                className="mt-4"
                size="sm"
                type="button"
                onClick={() => status.mutate({ orderId: row.id, next: "dispatched" })}
              >
                Mark on the way
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
