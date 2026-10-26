"use client";

import { formatNaira } from "@sakwa/utils";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function GrowthChart({
  rows,
}: {
  rows: { cycle_start: string; amount_kobo: number }[];
}) {
  const data = useMemo(() => {
    let running = 0;
    return [...rows]
      .sort((a, b) => a.cycle_start.localeCompare(b.cycle_start))
      .map((row) => {
        running += row.amount_kobo;
        return { week: row.cycle_start, total: running };
      });
  }, [rows]);

  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full rounded-lg border border-border p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(value) => formatNaira(value)} width={88} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => formatNaira(Number(value))} />
          <Line type="monotone" dataKey="total" stroke="#166534" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
