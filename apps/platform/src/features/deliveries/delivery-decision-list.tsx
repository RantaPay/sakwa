"use client";

import { Button, ConfirmDialog, Field, Input, StatusBadge } from "@sakwa/ui";
import { formatNaira, toLagosDate } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QueryGate } from "@/components/query-gate";
import { listAdvances } from "@/features/advances";
import { useAuthUser } from "@/lib/use-auth-user";
import { inScope, useStoreScope } from "@/features/stock/use-store-scope";
import { useWarehouseDeliveries } from "./use-deliveries";

export function DeliveryDecisionList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError, decide } = useWarehouseDeliveries();
  const scope = useStoreScope();
  const advances = useQuery({ queryKey: ["advances"], queryFn: () => listAdvances() });
  const rows = (data ?? []).filter((row) => inScope(scope.ids, row.warehouse_id));

  return (
    <QueryGate
      isLoading={isLoading || !scope.ready}
      isError={isError}
      isEmpty={rows.length === 0}
      emptyTitle="No incoming rice"
      emptyBody={
        scope.limited && scope.ids?.length === 0
          ? "No store is assigned to this login."
          : "When an agent records a delivery, it will wait here."
      }
    >
      <ul className="grid gap-3">
        {rows.map((row) => {
          const linked = (advances.data ?? []).find(
            (item) =>
              item.agent_id === row.agent_id &&
              item.warehouse_id === row.warehouse_id &&
              item.status === "paid",
          );
          return (
            <li key={row.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {row.bag_count} bags · {row.kg_per_bag} kg
                  </p>
                  <p className="text-sm text-muted">
                    Spent {formatNaira(row.amount_spent_kobo)} ·{" "}
                    {toLagosDate(row.delivered_on)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              {linked ? (
                <p className="mt-2 text-sm text-muted">
                  Expected {linked.expected_bag_count ?? "some"} bags ·{" "}
                  {linked.expected_kg ?? "some"} kg. {linked.purpose || "Buying rice"}.
                </p>
              ) : null}
              {row.status === "pending" && user ? (
                <ReceiveForm
                  formId={row.id}
                  onConfirm={(bagsReceived, bagsDamaged) =>
                    decide.mutate({
                      id: row.id,
                      warehouseId: row.warehouse_id,
                      bagCount: row.bag_count,
                      kgPerBag: Number(row.kg_per_bag),
                      bagsReceived,
                      bagsDamaged,
                      agentId: row.agent_id,
                      status: "confirmed",
                      userId: user.id,
                    })
                  }
                />
              ) : null}
              {row.status === "pending" && user ? (
                <div className="mt-4 flex flex-wrap gap-2">
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
          );
        })}
      </ul>
    </QueryGate>
  );
}

function ReceiveForm({
  formId,
  onConfirm,
}: {
  formId: string;
  onConfirm: (received: number, damaged: number) => void;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-3"
      action={(formData) => {
        const received = Number(formData.get("received"));
        const damaged = Number(formData.get("damaged") || 0);
        if (
          !Number.isInteger(received) ||
          received < 0 ||
          damaged < 0 ||
          damaged > received
        ) {
          setError("Damaged bags cannot be more than the bags received.");
          return;
        }
        setError("");
        onConfirm(received, damaged);
      }}
    >
      <Field label="Bags received" htmlFor={`received-${formId}`}>
        <Input id={`received-${formId}`} name="received" inputMode="numeric" required />
      </Field>
      <Field label="Damaged bags" htmlFor={`damaged-${formId}`}>
        <Input
          id={`damaged-${formId}`}
          name="damaged"
          inputMode="numeric"
          defaultValue="0"
        />
      </Field>
      <div className="flex items-end">
        <Button size="sm" type="submit">
          Confirm arrival
        </Button>
      </div>
      {error ? <p className="text-sm text-danger sm:col-span-3">{error}</p> : null}
    </form>
  );
}
