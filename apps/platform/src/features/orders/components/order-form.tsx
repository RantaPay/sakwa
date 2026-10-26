"use client";

import { Button, Field, Input, Textarea } from "@sakwa/ui";
import { orderSchema } from "@sakwa/validators";
import { useState } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useCustomerOrders } from "../hooks/use-orders";

export function OrderForm() {
  const { data: user } = useAuthUser();
  const { create } = useCustomerOrders(user?.id);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = orderSchema.omit({ id: true }).safeParse({
      bagCount: Number(formData.get("bagCount")),
      kgPerBag: Number(formData.get("kgPerBag")),
      deliveryDetails: String(formData.get("deliveryDetails") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await create.mutateAsync({ ...parsed.data, customerId: user.id });
  }

  return (
    <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
      <Field label="Number of bags" htmlFor="bagCount">
        <Input id="bagCount" name="bagCount" inputMode="numeric" required />
      </Field>
      <Field label="Kg per bag" htmlFor="kgPerBag">
        <Input id="kgPerBag" name="kgPerBag" inputMode="decimal" required />
      </Field>
      <Field label="Where should it go" htmlFor="deliveryDetails">
        <Textarea id="deliveryDetails" name="deliveryDetails" rows={3} required />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Placing" : "Place order"}
      </Button>
    </form>
  );
}
