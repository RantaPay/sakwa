"use client";

import { Button } from "@sakwa/ui";
import { formatNaira, lagosToday, tradeLine } from "@sakwa/utils";
import { useMemo, useState } from "react";
import { rateForStore } from "./data";
import { parseGrid, type SheetRow } from "./parse-sheet";

export type EntryDraft = {
  warehouseId: string;
  entryOn: string;
  bagsSold: number | null;
  kgSold: number | null;
  bagsBought: number | null;
  kgBought: number | null;
  fingerprint: string;
  buyingKobo: number;
  sellingKobo: number;
  salesKobo: number;
  expenseKobo: number;
  profitKobo: number;
  notes: string;
  source: "manual" | "import";
};

type Rates = {
  effective_on: string;
  buying_price_per_kg_kobo: number;
  selling_price_per_kg_kobo: number;
  created_at?: string;
}[];

type StoreRates = {
  warehouse_id: string;
  effective_on: string;
  buying_price_per_kg_kobo: number;
  selling_price_per_kg_kobo: number;
  created_at?: string;
}[];

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function buildEntry(
  formData: FormData,
  kgPerBag: number,
  house: Rates,
  storePrices: StoreRates,
  source: "manual" | "import",
  extra?: {
    bagsSold: number | null;
    kgSold: number | null;
    bagsBought: number | null;
    kgBought: number | null;
    amount: number | null;
    occurrence: number;
  },
): EntryDraft | { error: string } {
  const id = String(formData.get("store") ?? "");
  const entryOn = String(formData.get("day") ?? "");
  const bagsSold = extra?.bagsSold ?? optionalNumber(formData.get("bagsSold"));
  let kgSold = extra?.kgSold ?? optionalNumber(formData.get("kgSold"));
  const bagsBought = extra?.bagsBought ?? optionalNumber(formData.get("bagsBought"));
  const kgBought = extra?.kgBought ?? optionalNumber(formData.get("kgBought"));
  const rate = rateForStore(id, entryOn, house, storePrices);
  if (!rate) return { error: "No buying and selling rate is set." };
  if (
    (kgSold == null || kgSold === 0) &&
    extra?.amount &&
    rate.selling_price_per_kg_kobo > 0
  ) {
    kgSold = (extra.amount * 100) / rate.selling_price_per_kg_kobo;
  }
  const line = tradeLine({
    bagsSold,
    kgSold,
    bagsBought,
    kgBought,
    kgPerBag,
    buyingPerKgKobo: rate.buying_price_per_kg_kobo,
    sellingPerKgKobo: rate.selling_price_per_kg_kobo,
  });
  if ("error" in line) return line;
  const occurrence = extra?.occurrence ?? 1;
  return {
    warehouseId: id,
    entryOn,
    bagsSold: line.bagsSold || null,
    kgSold: line.kgSold,
    bagsBought: line.bagsBought || null,
    kgBought: line.kgBought,
    fingerprint: `${id}|${entryOn}|${line.bagsSold}|${line.kgSold}|${line.bagsBought}|${line.kgBought}|${occurrence}`,
    buyingKobo: rate.buying_price_per_kg_kobo,
    sellingKobo: rate.selling_price_per_kg_kobo,
    salesKobo: line.salesKobo,
    expenseKobo: line.expenseKobo,
    profitKobo: line.profitKobo,
    notes: source === "import" ? "Imported sheet" : "Entered by hand",
    source,
  };
}

function matchStore(name: string, stores: { id: string; name: string }[]) {
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return (
    stores.find((store) => store.name.toLowerCase().replace(/[^a-z0-9]+/g, "") === key) ??
    stores.find((store) => {
      const storeKey = store.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return key.includes(storeKey) || storeKey.includes(key);
    })
  );
}

export function SheetUpload({
  stores,
  kgPerBag,
  house,
  storePrices,
  onSave,
}: {
  stores: { id: string; name: string }[];
  kgPerBag: number;
  house: Rates;
  storePrices: StoreRates;
  onSave: (
    rows: EntryDraft[],
    signature: string,
    mapping: Record<string, string>,
  ) => Promise<void>;
}) {
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const ready = useMemo(() => rows.filter((row) => row.status === "ready"), [rows]);

  async function onFile(file: File) {
    setError("");
    const Excel = await import("exceljs");
    const book = new Excel.Workbook();
    await book.xlsx.load(await file.arrayBuffer());
    const collected: SheetRow[] = [];
    let found = "";
    book.eachSheet((sheet) => {
      const grid = sheet
        .getSheetValues()
        .slice(1)
        .map((row) => {
          const cells = Array.isArray(row) ? row : [];
          return cells.slice(1).map((cell) => cellToText(cell));
        });
      const parsed = parseGrid({
        sheetName: sheet.name,
        fileName: file.name,
        rows: grid,
        today: lagosToday(),
      });
      if (!parsed.error) {
        found = parsed.signature;
        collected.push(...parsed.rows);
      }
    });
    setSignature(found);
    setRows(collected);
    if (collected.length === 0) setError("No heading row was found.");
  }

  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Upload a sheet</h2>
      <p className="mt-1 text-sm text-muted">
        Column order does not matter. A total row is checked and not saved as another
        sale.
      </p>
      <input
        className="mt-4 block text-sm"
        type="file"
        accept=".xlsx,.xls"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFile(file);
        }}
      />
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {rows.length > 0 ? (
        <>
          <p className="mt-3 text-sm">
            {ready.length} rows ready ·{" "}
            {rows.filter((row) => row.status === "skip").length} totals held back ·{" "}
            {rows.filter((row) => row.status === "problem").length} need a look
          </p>
          <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-sm">
            {rows.slice(0, 40).map((row) => (
              <li key={`${row.rowNumber}-${row.storeName}`}>
                Row {row.rowNumber}:{" "}
                {row.status === "ready"
                  ? `${row.storeName} · ${row.bagsSold ?? 0} bags · ${row.kgSold ?? 0} kg`
                  : row.reason}
              </li>
            ))}
          </ul>
          <Button
            className="mt-4"
            type="button"
            onClick={() => {
              const drafts: EntryDraft[] = [];
              const seen = new Map<string, number>();
              for (const row of ready) {
                const store = matchStore(row.storeName, stores);
                if (!store) {
                  setError(`No store matches "${row.storeName}".`);
                  return;
                }
                const form = new FormData();
                form.set("store", store.id);
                form.set("day", row.entryOn);
                const key = `${store.id}|${row.entryOn}|${row.bagsSold}|${row.kgSold}|${row.bagsBought}|${row.kgBought}`;
                const occurrence = (seen.get(key) ?? 0) + 1;
                seen.set(key, occurrence);
                const built = buildEntry(form, kgPerBag, house, storePrices, "import", {
                  bagsSold: row.bagsSold,
                  kgSold: row.kgSold,
                  bagsBought: row.bagsBought,
                  kgBought: row.kgBought,
                  amount: row.amount,
                  occurrence,
                });
                if ("error" in built) {
                  setError(`Row ${row.rowNumber}: ${built.error}`);
                  return;
                }
                drafts.push(built);
              }
              void onSave(drafts, signature, {});
            }}
          >
            Save ready rows
          </Button>
        </>
      ) : null}
    </section>
  );
}

function cellToText(cell: unknown): string {
  if (cell == null) return "";
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  if (typeof cell === "object" && cell && "result" in cell)
    return cellToText((cell as { result?: unknown }).result);
  if (typeof cell === "object" && cell && "text" in cell)
    return String((cell as { text?: unknown }).text ?? "");
  return String(cell).trim();
}

export function Report({
  entries,
  stores,
}: {
  entries: {
    warehouse_id: string;
    entry_on: string;
    sales_kobo: number;
    expense_kobo: number;
    profit_kobo: number;
    bags_sold: number | null;
    kg_sold: number | null;
  }[];
  stores: { id: string; name: string }[];
}) {
  const sales = entries.reduce((sum, row) => sum + Number(row.sales_kobo), 0);
  const expense = entries.reduce((sum, row) => sum + Number(row.expense_kobo), 0);
  const profit = entries.reduce((sum, row) => sum + Number(row.profit_kobo), 0);
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface p-5">
      <h2 className="text-xl font-semibold">Entered lines</h2>
      <p className="mt-2 text-sm">
        Sales {formatNaira(sales)} · Expense {formatNaira(expense)} · Profit{" "}
        {formatNaira(profit)}
      </p>
      <ul className="mt-3 divide-y divide-border text-sm">
        {entries.slice(0, 30).map((row, index) => (
          <li
            key={`${row.warehouse_id}-${row.entry_on}-${index}`}
            className="flex flex-wrap justify-between gap-2 py-2"
          >
            <span>
              {stores.find((store) => store.id === row.warehouse_id)?.name ?? "Store"} ·{" "}
              {row.entry_on} · {row.bags_sold ?? 0} bags · {row.kg_sold ?? 0} kg
            </span>
            <span>Profit {formatNaira(row.profit_kobo)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
