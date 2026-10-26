"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import type { ReturnFormulaKind } from "@sakwa/utils";
import { PageHeading } from "@/components/page-heading";
import { ReturnList, useReturns } from "@/features/returns";

export function ReturnsClient({
  kind,
  weeklyPercentBps,
}: {
  kind: ReturnFormulaKind;
  weeklyPercentBps: number;
}) {
  const { apply } = useReturns();

  async function onSubmit(formData: FormData) {
    await apply.mutateAsync({
      cycleStart: String(formData.get("cycleStart")),
      cycleEnd: String(formData.get("cycleEnd")),
      kind,
      weeklyPercentBps,
      periodProfitKobo: formData.get("profit")
        ? BigInt(Math.round(Number(formData.get("profit")) * 100))
        : undefined,
    });
  }

  return (
    <div>
      <PageHeading
        title="Returns"
        body="The way returns are calculated is not yet confirmed. This screen writes rows using the current setting so it can be changed later without touching the rest of the books."
      />
      <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
        <Field label="Week starts" htmlFor="cycleStart">
          <Input id="cycleStart" name="cycleStart" type="date" required />
        </Field>
        <Field label="Week ends" htmlFor="cycleEnd">
          <Input id="cycleEnd" name="cycleEnd" type="date" required />
        </Field>
        <Field
          label="Period profit in naira (only if sharing profit)"
          htmlFor="profit"
          hint="Leave empty when using a fixed weekly percent."
        >
          <Input id="profit" name="profit" inputMode="numeric" />
        </Field>
        <Select disabled value={kind}>
          <option value="fixed_weekly_percent">Fixed weekly percent</option>
          <option value="profit_share">Share of profit</option>
        </Select>
        <Button type="submit" disabled={apply.isPending}>
          {apply.isPending ? "Writing" : "Write this week's returns"}
        </Button>
      </form>
      <ReturnList />
    </div>
  );
}
