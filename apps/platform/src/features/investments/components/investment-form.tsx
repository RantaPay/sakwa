"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { investmentSchema } from "@sakwa/validators";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listUsersByRole } from "@/features/users";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useInvestments } from "../hooks/use-investments";

export function InvestmentForm() {
  const { data: user } = useAuthUser();
  const { create } = useInvestments();
  const investors = useQuery({
    queryKey: ["users", "investor"],
    queryFn: () => listUsersByRole("investor"),
  });
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = investmentSchema.omit({ id: true }).safeParse({
      investorId: String(formData.get("investorId") ?? ""),
      amountNaira: Number(formData.get("amount")),
      investedOn: String(formData.get("investedOn") ?? ""),
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
      <Field label="Investor" htmlFor="investorId">
        <Select id="investorId" name="investorId" required>
          <option value="">Choose an investor</option>
          {(investors.data ?? []).map((person) => (
            <option key={person.id} value={person.id}>
              {person.full_name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Amount in naira" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="numeric" required />
      </Field>
      <Field label="Date" htmlFor="investedOn">
        <Input id="investedOn" name="investedOn" type="date" required />
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
        {create.isPending ? "Saving" : "Record capital"}
      </Button>
    </form>
  );
}
