"use client";

import { lagosToday } from "@sakwa/utils";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { payRequestSchema } from "@sakwa/validators";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { listWarehouses } from "@/features/stock";
import { listUsersByRole } from "@/features/users";
import { useAuthUser } from "@/lib/use-auth-user";
import { useAdvances } from "./use-advances";

export function AgentPayScreen() {
  const { data: user } = useAuthUser();
  const { request } = useAdvances();
  const agents = useQuery({
    queryKey: ["users", "agent"],
    queryFn: () => listUsersByRole("agent"),
  });
  const stores = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = payRequestSchema.omit({ id: true }).safeParse({
      agentId: String(formData.get("agentId") ?? ""),
      warehouseId: String(formData.get("warehouseId") ?? ""),
      amountNaira: Number(formData.get("amount")),
      purpose: String(formData.get("purpose") ?? ""),
      expectedBagCount: Number(formData.get("bags")),
      expectedKg: Number(formData.get("kg")),
      advancedOn: String(formData.get("advancedOn") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await request.mutateAsync({ ...parsed.data, requestedBy: user.id });
  }

  const openStores = (stores.data ?? []).filter((row) => row.is_active !== false);

  return (
    <div>
      <PageHeading
        mark="cash_given"
        title="Pay an agent"
        body="Say which store the rice is for, what the money is for, and the bags and kg you expect. The accountant pays it."
      />
      <form action={onSubmit} className="grid max-w-lg gap-4">
        <Field label="Agent" htmlFor="agentId">
          <Select id="agentId" name="agentId" required>
            <option value="">Choose an agent</option>
            {(agents.data ?? []).map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name} ({person.email})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Store" htmlFor="warehouseId">
          <Select id="warehouseId" name="warehouseId" required>
            <option value="">Choose a store</option>
            {openStores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="What the money is for" htmlFor="purpose">
          <Input id="purpose" name="purpose" required />
        </Field>
        <Field label="Amount in naira" htmlFor="amount">
          <Input id="amount" name="amount" inputMode="numeric" required />
        </Field>
        <Field label="Expected bags" htmlFor="bags">
          <Input id="bags" name="bags" inputMode="numeric" required />
        </Field>
        <Field label="Expected kg" htmlFor="kg">
          <Input id="kg" name="kg" inputMode="decimal" required />
        </Field>
        <Field label="Date" htmlFor="advancedOn">
          <Input
            id="advancedOn"
            name="advancedOn"
            type="date"
            required
            defaultValue={lagosToday()}
          />
        </Field>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={request.isPending}>
          {request.isPending ? "Sending" : "Send to the accountant"}
        </Button>
      </form>
    </div>
  );
}
