"use client";

import { Button, Field, Input, Select } from "@sakwa/ui";
import { formatNaira, lagosToday } from "@sakwa/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthUser } from "@/lib/use-auth-user";
import { listHouseCapital, recordHouseCapital } from "./house-capital";

export function HouseCapitalForm() {
  const client = useQueryClient();
  const { data: user } = useAuthUser();
  const rows = useQuery({ queryKey: ["house-capital"], queryFn: listHouseCapital });
  const [error, setError] = useState("");
  const total = (rows.data ?? []).reduce((sum, row) => sum + Number(row.amount_kobo), 0);

  return (
    <section className="mt-8 rounded-[1.75rem] border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">House capital</h2>
      <p className="mt-1 text-sm text-muted">
        Initial capital and any other money put into the business. This is not investor
        capital, so it does not earn investor interest. It is counted in capital in and in
        the books.
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold">{formatNaira(total)}</p>
      <form
        className="mt-4 grid gap-3 md:grid-cols-2"
        action={async (formData) => {
          if (!user) return;
          const amount = Number(formData.get("amount"));
          const kind = String(formData.get("kind") ?? "");
          if (!(amount > 0) || (kind !== "initial" && kind !== "other")) {
            setError("Enter the amount and what kind of capital it is.");
            return;
          }
          setError("");
          await recordHouseCapital({
            kind,
            amountNaira: amount,
            investedOn: String(formData.get("day")),
            recordedBy: user.id,
            notes: String(formData.get("notes") ?? ""),
          });
          await client.invalidateQueries({ queryKey: ["house-capital"] });
        }}
      >
        <Field label="Kind" htmlFor="kind">
          <Select id="kind" name="kind" required defaultValue="initial">
            <option value="initial">Initial capital</option>
            <option value="other">Other investment</option>
          </Select>
        </Field>
        <Field label="Amount in naira" htmlFor="house-amount">
          <Input id="house-amount" name="amount" inputMode="numeric" required />
        </Field>
        <Field label="Date" htmlFor="house-day">
          <Input
            id="house-day"
            name="day"
            type="date"
            required
            defaultValue={lagosToday()}
          />
        </Field>
        <Field label="Note" htmlFor="house-notes">
          <Input id="house-notes" name="notes" />
        </Field>
        <Button type="submit">Save capital</Button>
      </form>
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      <ul className="mt-4 divide-y divide-border text-sm">
        {(rows.data ?? []).map((row) => (
          <li key={row.id} className="flex flex-wrap justify-between gap-2 py-2">
            <span>
              {row.kind === "initial" ? "Initial capital" : "Other investment"} ·{" "}
              {row.invested_on}
              {row.notes ? ` · ${row.notes}` : ""}
            </span>
            <span className="font-mono">{formatNaira(row.amount_kobo)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
