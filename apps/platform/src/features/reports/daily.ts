import { bookDay, formatNaira, toLagosDateTime } from "@sakwa/utils";
import { listAdvances } from "@/features/advances";
import { listWarehouseDeliveries } from "@/features/deliveries";
import { listPayments, listTransactions } from "@/features/money";
import { listMovements } from "@/features/stock";

function download(name: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function today() {
  return bookDay(new Date().toISOString());
}

export async function downloadStoreDay(warehouseIds?: string[] | null) {
  const [movements, deliveries] = await Promise.all([
    listMovements(),
    listWarehouseDeliveries(),
  ]);
  const day = today();
  const rows: string[][] = [["When", "Kind", "Bags", "Kg", "Note"]];
  for (const row of movements) {
    if (warehouseIds && !warehouseIds.includes(row.warehouse_id)) continue;
    if (bookDay(row.created_at) !== day) continue;
    rows.push([
      toLagosDateTime(row.created_at),
      row.direction === "in" ? "In" : "Out",
      String(row.bag_count),
      String(row.total_kg),
      "",
    ]);
  }
  for (const row of deliveries) {
    if (warehouseIds && !warehouseIds.includes(row.warehouse_id)) continue;
    if (bookDay(row.delivered_on) !== day && bookDay(row.created_at) !== day) continue;
    rows.push([
      toLagosDateTime(row.created_at),
      "Supply",
      String(row.bags_received ?? row.bag_count),
      String(row.kg_per_bag),
      Number(row.bags_damaged ?? 0) > 0 ? `${row.bags_damaged} damaged` : row.status,
    ]);
  }
  download(`sakwa-store-${day}.csv`, rows);
}

export async function downloadAccountantDay() {
  const [transactions, advances, payments] = await Promise.all([
    listTransactions(),
    listAdvances(),
    listPayments(),
  ]);
  const day = today();
  const rows: string[][] = [["When", "Kind", "Amount", "Note"]];
  for (const row of transactions) {
    if (bookDay(row.occurred_on) !== day && bookDay(row.created_at) !== day) continue;
    rows.push([
      row.occurred_on,
      row.direction,
      formatNaira(row.amount_kobo),
      row.description,
    ]);
  }
  for (const row of advances) {
    const when = row.paid_at ?? row.advanced_on;
    if (bookDay(when) !== day) continue;
    rows.push([
      when,
      "Agent payment",
      formatNaira(row.amount_kobo),
      row.purpose || row.notes || "",
    ]);
  }
  for (const row of payments) {
    if (bookDay(row.created_at) !== day) continue;
    rows.push([
      toLagosDateTime(row.created_at),
      "Customer payment",
      formatNaira(row.amount_kobo),
      row.notes || "",
    ]);
  }
  download(`sakwa-money-${day}.csv`, rows);
}
