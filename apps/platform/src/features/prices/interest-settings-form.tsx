"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { weeklyInterestSchema } from "@sakwa/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SectionMark } from "@/components/shell/section-icons";
import { queryKeys } from "@/lib/query-keys";
import { useAuthUser } from "@/lib/use-auth-user";
import { listHouseSettings, saveWeeklyInterest } from "./house-settings";

function percentLabel(bps: number) {
  const value = bps / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function InterestSettingsForm() {
  const { data: user } = useAuthUser();
  const client = useQueryClient();
  const [error, setError] = useState("");
  const settings = useQuery({ queryKey: queryKeys.houseSettings, queryFn: listHouseSettings });
  const current = settings.data?.weekly_interest_bps;

  const save = useMutation({
    mutationFn: saveWeeklyInterest,
    onSuccess: async () => {
      setError("");
      await client.invalidateQueries({ queryKey: queryKeys.houseSettings });
    },
  });

  async function onSubmit(formData: FormData) {
    setError("");
    if (!user) return;
    const parsed = weeklyInterestSchema.safeParse({
      percent: Number(formData.get("percent")),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the percent.");
      return;
    }
    try {
      await save.mutateAsync({ percent: parsed.data.percent, updatedBy: user.id });
    } catch {
      setError("Could not save the weekly interest. Try again.");
    }
  }

  return (
    <section className="mt-10 max-w-lg" aria-label="Weekly investor interest">
      <div className="mb-2 flex items-center gap-3">
        <SectionMark mark="weekly_interest" size={22} className="size-12" />
        <h2 className="text-xl font-semibold">Weekly investor interest</h2>
      </div>
      <p className="mb-4 text-sm text-muted">
        {current == null
          ? "Percent of each investor's capital, credited once a week."
          : `Current rate: ${percentLabel(current)}% of capital each week.`}
      </p>
      <form action={onSubmit} className="grid gap-4 rounded-lg border border-border p-5">
        <Field label="Percent each week" htmlFor="percent" hint="2 means 2% of their capital.">
          <Input
            id="percent"
            name="percent"
            inputMode="decimal"
            required
            key={current ?? "empty"}
            defaultValue={current == null ? undefined : percentLabel(current)}
          />
        </Field>
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving" : "Save weekly interest"}
        </Button>
      </form>
    </section>
  );
}
