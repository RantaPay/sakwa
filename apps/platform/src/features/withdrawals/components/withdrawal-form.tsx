"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { withdrawalSchema } from "@sakwa/validators";
import { useState } from "react";
import { usePosition } from "@/features/investments";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useWithdrawals } from "../hooks/use-withdrawals";

export function WithdrawalForm() {
  const { data: user } = useAuthUser();
  const { request } = useWithdrawals(user?.id);
  const position = usePosition(user?.id);
  const [error, setError] = useState("");
  const available = position.data?.withdrawable_kobo ?? 0;

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = withdrawalSchema.omit({ id: true }).safeParse({
      amountNaira: Number(formData.get("amount")),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the amount.");
      return;
    }
    try {
      await request.mutateAsync({
        investorId: user.id,
        amountNaira: parsed.data.amountNaira,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the request.");
    }
  }

  return (
    <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
      <p className="text-sm text-muted">
        You can take out profit only. Available:{" "}
        <span className="font-mono text-foreground">{formatNaira(available)}</span>
      </p>
      <Field label="Amount in naira" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="numeric" required />
      </Field>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={request.isPending}>
        {request.isPending ? "Sending" : "Request profit"}
      </Button>
    </form>
  );
}
