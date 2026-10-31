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
    const sorted = [...rows].sort((a, b) => a.cycle_start.localeCompare(b.cycle_start));
    return sorted.reduce<{ week: string; total: number }[]>((points, row) => {
      const total = (points.at(-1)?.total ?? 0) + row.amount_kobo;
      return [...points, { week: row.cycle_start, total }];
    }, []);
  }, [rows]);

  if (data.length === 0) return null;

  return (
    <div className="h-72 w-full rounded-lg border border-border p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e7e5e4" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 13 }} />
          <YAxis tickFormatter={(value) => formatNaira(value)} width={108} tick={{ fontSize: 13 }} />
          <Tooltip formatter={(value) => formatNaira(Number(value))} />
          <Line type="monotone" dataKey="total" stroke="#315528" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
