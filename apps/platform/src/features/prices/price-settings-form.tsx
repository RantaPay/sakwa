"use client";

import { Button, Field, Input, Textarea } from "@sakwa/ui";
import { formatNaira } from "@sakwa/utils";
import { marketPriceSchema } from "@sakwa/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SectionMark } from "@/components/shell/section-icons";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { listMarketPrices, recordMarketPrice } from "./market-prices";

function lagosToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function PriceSettingsForm() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const prices = useQuery({ queryKey: queryKeys.marketPrices, queryFn: listMarketPrices });
  const latest = prices.data?.[0];

  const save = useMutation({
    mutationFn: recordMarketPrice,
    onSuccess: async () => {
      setError("");
      await client.invalidateQueries({ queryKey: queryKeys.marketPrices });
      await client.invalidateQueries({ queryKey: ["trade-books"] });
    },
  });

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = marketPriceSchema.safeParse({
      buyingNaira: Number(formData.get("buying")),
      sellingNaira: Number(formData.get("selling")),
      effectiveOn: String(formData.get("effectiveOn") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    try {
      await save.mutateAsync({ ...parsed.data, recordedBy: user.id });
    } catch {
      setError("Could not save prices. Try again.");
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <section className="lg:col-span-5" aria-label="Set prices">
        <div className="mb-4 flex items-center gap-3">
          <SectionMark mark="buying_price" size={22} className="size-12" />
          <h2 className="text-xl font-semibold">Set prices</h2>
        </div>
        {latest ? (
          <p className="mb-4 text-sm text-muted">
            Current:{" "}
            <span className="font-mono text-foreground">
              {formatNaira(latest.buying_price_per_kg_kobo)}
            </span>{" "}
            buying,{" "}
            <span className="font-mono text-foreground">
              {formatNaira(latest.selling_price_per_kg_kobo)}
            </span>{" "}
            selling, per kg from {latest.effective_on}.
          </p>
        ) : (
          <p className="mb-4 text-sm text-muted">No price is on the books yet.</p>
        )}
        <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5">
          <Field label="Buying price per kg in naira" htmlFor="buying">
            <Input id="buying" name="buying" inputMode="decimal" required />
          </Field>
          <Field label="Selling price per kg in naira" htmlFor="selling">
            <Input id="selling" name="selling" inputMode="decimal" required />
          </Field>
          <Field label="From this date" htmlFor="effectiveOn">
            <Input id="effectiveOn" name="effectiveOn" type="date" required defaultValue={lagosToday()} />
          </Field>
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} />
          </Field>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving" : "Save prices"}
          </Button>
        </form>
      </section>
      <section className="lg:col-span-7" aria-label="Price history">
        <h2 className="mb-4 text-xl font-semibold">Price history</h2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {(prices.data ?? []).map((row) => (
            <li key={row.id} className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="font-mono text-lg">
                  {formatNaira(row.buying_price_per_kg_kobo)} buy ·{" "}
                  {formatNaira(row.selling_price_per_kg_kobo)} sell
                </p>
                <p className="text-sm text-muted">{row.notes || "No note"}</p>
              </div>
              <p className="text-sm text-muted">{row.effective_on}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
