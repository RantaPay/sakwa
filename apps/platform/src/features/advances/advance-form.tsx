"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { cashAdvanceSchema } from "@sakwa/validators";
import { useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import { listUsersByRole } from "@/features/users";
import { useQuery } from "@tanstack/react-query";
import { useAdvances } from "./use-advances";

export function AdvanceForm() {
  const { data: user } = useAuthUser();
  const { create } = useAdvances();
  const agents = useQuery({
    queryKey: ["users", "agent"],
    queryFn: () => listUsersByRole("agent"),
  });
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = cashAdvanceSchema.omit({ id: true }).safeParse({
      agentId: String(formData.get("agentId") ?? ""),
      amountNaira: Number(formData.get("amount")),
      advancedOn: String(formData.get("advancedOn") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await create.mutateAsync({ ...parsed.data, recordedBy: user.id });
  }

  return (
    <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
      <Field label="Agent" htmlFor="agentId">
        <Select id="agentId" name="agentId" required>
          <option value="">Choose an agent</option>
          {(agents.data ?? []).map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Amount in naira" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="numeric" required />
      </Field>
      <Field label="Date" htmlFor="advancedOn">
        <Input id="advancedOn" name="advancedOn" type="date" required />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Input id="notes" name="notes" />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        {create.isPending ? "Saving" : "Record cash given"}
      </Button>
    </form>
  );
}
