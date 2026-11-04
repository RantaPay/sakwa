"use client";

import { deliveryTotalKg } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listAllOrders } from "@/features/orders";
import { listUsers } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";

export function OwingBoard() {
  const deliveries = useQuery({
    queryKey: queryKeys.deliveries(),
    queryFn: listWarehouseDeliveries,
  });
  const orders = useQuery({ queryKey: queryKeys.orders(), queryFn: listAllOrders });
  const people = useQuery({ queryKey: queryKeys.users, queryFn: listUsers });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));

  const agentBags = new Map<string, number>();
  for (const row of deliveries.data ?? []) {
    const damaged = Number(row.bags_damaged ?? 0);
    if (damaged <= 0) continue;
    agentBags.set(row.agent_id, (agentBags.get(row.agent_id) ?? 0) + damaged);
  }

  const customerBags = new Map<string, number>();
  for (const row of orders.data ?? []) {
    if (row.received_bag_count == null || row.released_bag_count == null) continue;
    const gap = Number(row.released_bag_count) - Number(row.received_bag_count);
    if (gap === 0) continue;
    customerBags.set(row.customer_id, (customerBags.get(row.customer_id) ?? 0) + gap);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Agent owing</h2>
        <p className="mb-3 text-sm text-muted">Damaged bags the store rejected.</p>
        {[...agentBags.entries()].length === 0 ? (
          <p className="text-muted">None.</p>
        ) : null}
        <ul className="space-y-2">
          {[...agentBags.entries()].map(([id, bags]) => (
            <li key={id} className="flex justify-between gap-3">
              <span>{names.get(id) ?? "Agent"}</span>
              <span className="font-semibold">{bags} bags</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Customer balance</h2>
        <p className="mb-3 text-sm text-muted">
          Bags still owed, or extra bags received.
        </p>
        {[...customerBags.entries()].length === 0 ? (
          <p className="text-muted">None.</p>
        ) : null}
        <ul className="space-y-2">
          {[...customerBags.entries()].map(([id, bags]) => (
            <li key={id} className="flex justify-between gap-3">
              <span>{names.get(id) ?? "Customer"}</span>
              <span className="font-semibold">
                {bags > 0 ? `${bags} bags still owed` : `${Math.abs(bags)} bags over`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function orderBagsLabel(bagCount: number, kgPerBag: number | string) {
  return `${bagCount} bags · ${deliveryTotalKg(bagCount, Number(kgPerBag))} kg`;
}
