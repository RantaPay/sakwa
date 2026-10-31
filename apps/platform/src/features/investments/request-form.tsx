"use client";

import { Button, Field, Input, Textarea } from "@sakwa/ui";
import { investmentRequestSchema } from "@sakwa/validators";
import { useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import { useInvestmentRequests } from "./use-requests";

export function InvestmentRequestForm() {
  const { data: user } = useAuthUser();
  const { request } = useInvestmentRequests(user?.id);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = investmentRequestSchema.safeParse({
      amountNaira: Number(formData.get("amount")),
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await request.mutateAsync({
      investorId: user.id,
      amountNaira: parsed.data.amountNaira,
      notes: parsed.data.notes,
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5">
      <Field label="Amount in naira" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="numeric" required />
      </Field>
      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={request.isPending}>
        {request.isPending ? "Sending" : "Ask to invest"}
      </Button>
    </form>
  );
}
