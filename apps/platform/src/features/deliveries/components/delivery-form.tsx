"use client";

import { Button, Field, Input, Select, Textarea } from "@sakwa/ui";
import { deliverySchema } from "@sakwa/validators";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listWarehouses } from "@/features/warehouses";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useAgentDeliveries } from "../hooks/use-deliveries";

export function DeliveryForm() {
  const { data: user } = useAuthUser();
  const { create } = useAgentDeliveries(user?.id);
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
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
    <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
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
      <Field label="Number of bags" htmlFor="bagCount">
        <Input id="bagCount" name="bagCount" inputMode="numeric" required />
      </Field>
      <Field label="Kg per bag" htmlFor="kgPerBag">
        <Input id="kgPerBag" name="kgPerBag" inputMode="decimal" required />
      </Field>
      <Field label="Amount spent in naira" htmlFor="amountSpent">
        <Input id="amountSpent" name="amountSpent" inputMode="numeric" required />
      </Field>
      <Field label="Date" htmlFor="deliveredOn">
        <Input id="deliveredOn" name="deliveredOn" type="date" required />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} />
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
