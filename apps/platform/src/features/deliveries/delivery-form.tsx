"use client";

import { Button, Field, Input, Select, Textarea } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { deliverySchema } from "@sakwa/validators";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAgentBalance } from "@/features/advances";
import { listWarehouses } from "@/features/stock";
import { useAuthUser } from "@/lib/use-auth-user";
import { useAgentDeliveries } from "./use-deliveries";

export function DeliveryForm() {
  const { data: user } = useAuthUser();
  const { create } = useAgentDeliveries(user?.id);
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
  const balance = useQuery({
    queryKey: ["agent-balance", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => getAgentBalance(user?.id as string),
  });
  const balanceKobo = BigInt(balance.data?.balance_kobo ?? 0);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = deliverySchema.omit({ id: true }).safeParse({
      warehouseId: String(formData.get("warehouseId") ?? ""),
      bagCount: Number(formData.get("bagCount")),
      kgPerBag: Number(formData.get("kgPerBag")),
      amountSpentNaira: Number(formData.get("amountSpent")),
      deliveredOn: String(formData.get("deliveredOn") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await create.mutateAsync({ ...parsed.data, agentId: user.id });
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between rounded-lg border border-border bg-wash px-3.5 py-2.5">
        <span className="text-xs font-medium text-muted">Amount left</span>
        <span className="font-mono text-base font-semibold text-foreground">
          {formatNaira(balanceKobo)}
        </span>
      </div>

      <Field label="Store" htmlFor="warehouseId">
        <Select id="warehouseId" name="warehouseId" required>
          <option value="">Choose a store</option>
          {(warehouses.data ?? []).map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Number of bags" htmlFor="bagCount">
          <Input id="bagCount" name="bagCount" inputMode="numeric" required />
        </Field>
        <Field label="Kg per bag" htmlFor="kgPerBag">
          <Input id="kgPerBag" name="kgPerBag" inputMode="decimal" required />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount spent (₦)" htmlFor="amountSpent">
          <Input id="amountSpent" name="amountSpent" inputMode="numeric" required />
        </Field>
        <Field label="Date" htmlFor="deliveredOn">
          <Input id="deliveredOn" name="deliveredOn" type="date" required />
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Saving" : "Record delivery"}
      </Button>
    </form>
  );
}
