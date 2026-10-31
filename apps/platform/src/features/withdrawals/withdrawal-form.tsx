"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { withdrawalSchema } from "@sakwa/validators";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePosition } from "@/features/investments";
import { getProfile } from "@/features/users";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { useWithdrawals } from "./use-withdrawals";

export function WithdrawalForm() {
  const { data: user } = useAuthUser();
  const { request } = useWithdrawals(user?.id);
  const position = usePosition(user?.id);
  const profile = useQuery({
    queryKey: queryKeys.profile(user?.id ?? "none"),
    enabled: Boolean(user?.id),
    queryFn: () => getProfile(user?.id as string),
  });
  const [error, setError] = useState("");
  const available = position.data?.withdrawable_kobo ?? 0;
  const saved = profile.data;

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = withdrawalSchema.omit({ id: true }).safeParse({
      amountNaira: Number(formData.get("amount")),
      payoutBankName: String(formData.get("bank") ?? ""),
      payoutAccountName: String(formData.get("accountName") ?? ""),
      payoutAccountNumber: String(formData.get("accountNumber") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the amount.");
      return;
    }
    try {
      await request.mutateAsync({
        investorId: user.id,
        amountNaira: parsed.data.amountNaira,
        payoutBankName: parsed.data.payoutBankName,
        payoutAccountName: parsed.data.payoutAccountName,
        payoutAccountNumber: parsed.data.payoutAccountNumber,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the request.");
    }
  }

  return (
    <form key={saved?.updated_at ?? "new"} action={onSubmit} className="mb-8 grid max-w-lg gap-4">
      <p className="text-sm text-muted">
        You can take out profit only. Available:{" "}
        <span className="font-mono text-foreground">{formatNaira(available)}</span>
      </p>
      <Field label="Amount in naira" htmlFor="amount">
        <Input id="amount" name="amount" inputMode="numeric" required />
      </Field>
      <Field label="Your bank" htmlFor="bank">
        <Input id="bank" name="bank" defaultValue={saved?.bank_name ?? ""} required />
      </Field>
      <Field label="Account name" htmlFor="accountName">
        <Input id="accountName" name="accountName" defaultValue={saved?.account_name ?? ""} required />
      </Field>
      <Field label="Account number" htmlFor="accountNumber">
        <Input
          id="accountNumber"
          name="accountNumber"
          inputMode="numeric"
          defaultValue={saved?.account_number ?? ""}
          required
        />
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
