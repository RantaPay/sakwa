"use client";

import { Button, StatusBadge } from "@sakwa/ui";
import { formatNaira, toLagosDate } from "@sakwa/utils";
import { useQuery } from "@tanstack/react-query";
import { figureText, useFigures } from "@/features/money/figures";
import { printReceipt } from "@/features/receipts/print-receipt";
import { listWarehouses } from "@/features/stock";
import { listUsers } from "@/features/users";
import { useAuthUser } from "@/lib/use-auth-user";
import { useAdvances } from "./use-advances";

export function PayQueue() {
  const { hidden } = useFigures();
  const { data: user } = useAuthUser();
  const { data, isLoading, pay } = useAdvances();
  const people = useQuery({ queryKey: ["users"], queryFn: listUsers });
  const stores = useQuery({ queryKey: ["warehouses"], queryFn: listWarehouses });
  const names = new Map((people.data ?? []).map((row) => [row.id, row.full_name]));
  const storeNames = new Map((stores.data ?? []).map((row) => [row.id, row.name]));
  const rows = data ?? [];
  const waiting = rows.filter((row) => row.status === "requested");
  const paid = rows.filter((row) => row.status !== "requested");

  function receipt(row: (typeof rows)[number]) {
    printReceipt("Payment to agent", [
      { label: "Agent", value: names.get(row.agent_id) ?? "Agent" },
      {
        label: "Store",
        value: row.warehouse_id
          ? (storeNames.get(row.warehouse_id) ?? "Store")
          : "Not set",
      },
      { label: "What it is for", value: row.purpose || row.notes || "Cash given" },
      { label: "Amount", value: formatNaira(row.amount_kobo) },
      {
        label: "Expected bags",
        value: row.expected_bag_count ? String(row.expected_bag_count) : "Not set",
      },
      {
        label: "Expected kg",
        value: row.expected_kg ? String(row.expected_kg) : "Not set",
      },
      { label: "Date", value: toLagosDate(row.paid_at ?? row.advanced_on) },
      { label: "Status", value: "Paid" },
    ]);
  }

  if (isLoading) return <p className="text-muted">Reading pay requests.</p>;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-xl font-semibold">Waiting for payment</h2>
        {waiting.length === 0 ? (
          <p className="text-muted">No pay request is waiting.</p>
        ) : (
          <ul className="grid gap-3">
            {waiting.map((row) => (
              <li key={row.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{names.get(row.agent_id) ?? "Agent"}</p>
                    <p className="text-sm text-muted">
                      {row.purpose || "Cash for rice"} ·{" "}
                      {row.warehouse_id
                        ? storeNames.get(row.warehouse_id)
                        : "Store not set"}
                    </p>
                    <p className="mt-1 font-mono">
                      {figureText(formatNaira(row.amount_kobo), hidden)}
                    </p>
                    <p className="text-sm text-muted">
                      Expect {row.expected_bag_count ?? 0} bags · {row.expected_kg ?? 0}{" "}
                      kg
                    </p>
                  </div>
                  <StatusBadge status="requested" />
                </div>
                {user ? (
                  <Button
                    className="mt-4"
                    size="sm"
                    type="button"
                    disabled={pay.isPending}
                    onClick={() => pay.mutate({ id: row.id, paidBy: user.id })}
                  >
                    Pay agent
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Paid</h2>
        <ul className="grid gap-3">
          {paid.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-semibold">{names.get(row.agent_id) ?? "Agent"}</p>
                <p className="font-mono text-sm">
                  {figureText(formatNaira(row.amount_kobo), hidden)}
                </p>
                <p className="text-sm text-muted">
                  {toLagosDate(row.paid_at ?? row.advanced_on)}
                </p>
              </div>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => receipt(row)}
              >
                Receipt
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
