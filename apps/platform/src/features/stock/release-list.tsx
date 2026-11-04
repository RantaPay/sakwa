"use client";

import { Button, Field, Input, StatusBadge } from "@sakwa/ui";
import {
  deliveryTotalKg,
  formatNaira,
  orderLineKobo,
  pricePerKgKobo,
} from "@sakwa/utils";
import { useState } from "react";
import { QueryGate } from "@/components/query-gate";
import { useAllOrders } from "@/features/orders";
import { useAuthUser } from "@/lib/use-auth-user";
import { inScope, useStoreScope } from "./use-store-scope";
import { useReleaseStock } from "./use-stock";

export function ReleaseList() {
  const { data: user } = useAuthUser();
  const { data, isLoading, isError } = useAllOrders();
  const scope = useStoreScope();
  const release = useReleaseStock();
  const ready = (data ?? []).filter(
    (row) => row.status === "approved" && inScope(scope.ids, row.warehouse_id),
  );

  return (
    <QueryGate
      isLoading={isLoading || !scope.ready}
      isError={isError}
      isEmpty={ready.length === 0}
      emptyTitle="Nothing waiting to go out"
      emptyBody={
        scope.limited && scope.ids?.length === 0
          ? "No store is assigned to this login."
          : "Orders the admin sends to this store will wait here."
      }
    >
      <ul className="grid gap-3">
        {ready.map((row) => (
          <li key={row.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {row.bag_count} bags ·{" "}
                  {deliveryTotalKg(row.bag_count, Number(row.kg_per_bag))} kg
                </p>
                <p className="text-sm text-muted">{row.delivery_details}</p>
                <p className="mt-1 font-mono text-sm">
                  {pricePerKgKobo(row) > 0
                    ? `${formatNaira(pricePerKgKobo(row))} per kg · ${formatNaira(orderLineKobo(row))}`
                    : "No price yet"}
                </p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {user && row.warehouse_id ? (
              <IssueForm
                formId={row.id}
                pending={release.isPending}
                onIssue={(bagCount, releasedTo) =>
                  release.mutate({
                    orderId: row.id,
                    warehouseId: row.warehouse_id as string,
                    bagCount,
                    kgPerBag: Number(row.kg_per_bag),
                    releasedTo,
                    recordedBy: user.id,
                  })
                }
              />
            ) : (
              <p className="mt-3 text-sm text-muted">
                A store must be assigned before release.
              </p>
            )}
          </li>
        ))}
      </ul>
    </QueryGate>
  );
}

function IssueForm({
  formId,
  pending,
  onIssue,
}: {
  formId: string;
  pending: boolean;
  onIssue: (bagCount: number, releasedTo: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-3"
      action={(formData) => {
        const bagCount = Number(formData.get("bags"));
        const releasedTo = String(formData.get("who") ?? "").trim();
        if (!Number.isInteger(bagCount) || bagCount <= 0 || releasedTo.length < 2) {
          setError("Type the bags you are issuing and who they are for.");
          return;
        }
        setError("");
        onIssue(bagCount, releasedTo);
      }}
    >
      <Field label="Bags issuing" htmlFor={`bags-${formId}`}>
        <Input id={`bags-${formId}`} name="bags" inputMode="numeric" required />
      </Field>
      <Field label="Released to" htmlFor={`who-${formId}`}>
        <Input id={`who-${formId}`} name="who" required />
      </Field>
      <div className="flex items-end">
        <Button size="sm" type="submit" disabled={pending}>
          Release bags
        </Button>
      </div>
      {error ? <p className="text-sm text-danger sm:col-span-3">{error}</p> : null}
    </form>
  );
}
