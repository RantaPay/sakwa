"use client";

import { Button, Field, Input } from "@sakwa/ui";
import { useQuery } from "@tanstack/react-query";
import { PageHeading } from "@/components/page-heading";
import { listHouseSettings } from "@/features/prices/house-settings";
import { queryKeys } from "@/lib/query-keys";
import { ReturnList } from "./return-list";
import { useReturns } from "./use-returns";

function percentLabel(bps: number) {
  const value = bps / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function ReturnsPanel({ weeklyPercentBps }: { weeklyPercentBps: number }) {
  const { apply } = useReturns();
  const settings = useQuery({ queryKey: queryKeys.houseSettings, queryFn: listHouseSettings });
  const bps = settings.data?.weekly_interest_bps ?? weeklyPercentBps;

  async function onSubmit(formData: FormData) {
    await apply.mutateAsync({
      cycleStart: String(formData.get("cycleStart")),
      cycleEnd: String(formData.get("cycleEnd")),
      kind: "fixed_weekly_percent",
      weeklyPercentBps: bps,
    });
  }

  return (
    <div>
      <PageHeading
        mark="returns_desk"
        title="Returns"
        body={`Each investor is credited ${percentLabel(bps)}% of their capital for the week. Admin sets that percent in Settings.`}
      />
      <form action={onSubmit} className="mb-8 grid max-w-lg gap-4">
        <Field label="Week starts" htmlFor="cycleStart">
          <Input id="cycleStart" name="cycleStart" type="date" required />
        </Field>
        <Field label="Week ends" htmlFor="cycleEnd">
          <Input id="cycleEnd" name="cycleEnd" type="date" required />
        </Field>
        <Button type="submit" disabled={apply.isPending}>
          {apply.isPending ? "Writing" : "Write this week's returns"}
        </Button>
      </form>
      <ReturnList />
    </div>
  );
}
