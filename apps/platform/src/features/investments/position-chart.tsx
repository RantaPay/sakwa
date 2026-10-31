"use client";

import { formatNaira } from "@sakwa/utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#315528", "#CAA673", "#8C7262"];

export function PositionChart({
  capitalKobo,
  returnsKobo,
  withdrawnKobo,
}: {
  capitalKobo: number;
  returnsKobo: number;
  withdrawnKobo: number;
}) {
  const data = [
    { name: "Capital in", value: Math.max(0, capitalKobo) },
    { name: "Returns", value: Math.max(0, returnsKobo) },
    { name: "Profit taken or waiting", value: Math.max(0, withdrawnKobo) },
  ].filter((row) => row.value > 0);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-base font-semibold">How the money sits</p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={104} paddingAngle={2}>
              {data.map((row) => (
                <Cell key={row.name} fill={COLORS[data.indexOf(row) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatNaira(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 grid gap-1 text-base">
        {data.map((row, index) => (
          <li key={row.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted">
              <span className="size-2 rounded-full" style={{ background: COLORS[index] }} />
              {row.name}
            </span>
            <span className="font-mono">{formatNaira(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
