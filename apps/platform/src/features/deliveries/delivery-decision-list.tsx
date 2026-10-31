"use client";

import { Button, ConfirmDialog, StatusBadge } from "@sakwa/ui";
import { formatNaira, toLagosDate } from "@sakwa/utils";
import { QueryGate } from "@/components/query-gate";
import { useAuthUser } from "@/lib/use-auth-user";
import { useWarehouseDeliveries } from "./use-deliveries";

export function DeliveryDecisionList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError, decide } = useWarehouseDeliveries();

  return (
    <QueryGate
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data?.length}
      emptyTitle="No incoming rice"
      emptyBody="When an agent records a delivery, it will wait here."
    >
      <ul className="grid gap-3">
        {(data ?? []).map((row) => (
          <li key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.bag_count} bags · {row.kg_per_bag} kg
                </p>
                <p className="text-sm text-muted">
                  Spent {formatNaira(row.amount_spent_kobo)} · {toLagosDate(row.delivered_on)}
                </p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.status === "pending" && user ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <ConfirmDialog
                  title="Confirm this delivery"
                  body="Confirmed bags are added to store stock and count against the agent."
                  confirmLabel="Confirm"
                  onConfirm={() =>
                    decide.mutate({
                      id: row.id,
                      warehouseId: row.warehouse_id,
                      bagCount: row.bag_count,
                      kgPerBag: Number(row.kg_per_bag),
                      status: "confirmed",
                      userId: user.id,
                    })
                  }
                >
                  <Button size="sm" type="button">
                    Confirm
                  </Button>
                </ConfirmDialog>
                <ConfirmDialog
                  title="Turn this delivery down"
                  body="The bags will not be added to stock. Give a reason if you can."
                  confirmLabel="Turn down"
                  tone="danger"
                  onConfirm={() => {
                    const reason = window.prompt("Reason") ?? "";
                    decide.mutate({
                      id: row.id,
                      warehouseId: row.warehouse_id,
                      bagCount: row.bag_count,
                      kgPerBag: Number(row.kg_per_bag),
                      status: "rejected",
                      userId: user.id,
                      reason,
                    });
                  }}
                >
                  <Button size="sm" variant="danger" type="button">
                    Turn down
                  </Button>
                </ConfirmDialog>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}
