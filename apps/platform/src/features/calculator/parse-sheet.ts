export type ColumnRole =
  | "date"
  | "store"
  | "bags_sold"
  | "kg_sold"
  | "bags_bought"
  | "kg_bought"
  | "amount"
  | "ignore";

export type SheetRow = {
  rowNumber: number;
  status: "ready" | "skip" | "problem";
  reason: string;
  storeName: string;
  entryOn: string;
  bagsSold: number | null;
  kgSold: number | null;
  bagsBought: number | null;
  kgBought: number | null;
  amount: number | null;
};

const ALIASES: { role: ColumnRole; words: string[] }[] = [
  {
    role: "bags_sold",
    words: ["bags sold", "bag sold", "sold bags", "qty sold", "quantity sold"],
  },
  { role: "kg_sold", words: ["kg sold", "kilos sold", "kilograms sold", "weight sold"] },
  {
    role: "bags_bought",
    words: ["bags bought", "bag bought", "bought bags", "bags in", "supply bags"],
  },
  {
    role: "kg_bought",
    words: ["kg bought", "kilos bought", "kilograms bought", "weight bought"],
  },
  {
    role: "bags_sold",
    words: ["bags", "bag", "bales", "qty", "quantity", "no of bags", "number of bags"],
  },
  { role: "kg_sold", words: ["kg", "kilo", "kilos", "kilogram", "kilograms", "weight"] },
  {
    role: "amount",
    words: ["amount", "naira", "value", "sales", "paid", "total amount"],
  },
  { role: "date", words: ["date", "day", "sold on", "entry date"] },
  { role: "store", words: ["store", "warehouse", "shop", "branch"] },
];

function norm(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function roleForHeader(header: string): ColumnRole {
  const text = norm(header);
  if (!text) return "ignore";
  for (const alias of ALIASES) {
    if (alias.words.some((word) => text === word || text.includes(word)))
      return alias.role;
  }
  return "ignore";
}

function parseNumber(value: string): number | null {
  const cleaned = value
    .replace(/₦/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .replace(/ngn/gi, "");
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function excelSerial(value: number) {
  const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  return date.toISOString().slice(0, 10);
}

export function parseDate(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000)
    return excelSerial(serial);
  const match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;
  const day = match[1]?.padStart(2, "0");
  const month = match[2]?.padStart(2, "0");
  let year = match[3] ?? "";
  if (year.length === 2) year = `20${year}`;
  return `${year}-${month}-${day}`;
}

function isTotal(cells: string[]) {
  const label = norm(cells.filter(Boolean).slice(0, 2).join(" "));
  return /^(total|grand total|subtotal|sum)\b/.test(label);
}

export function parseGrid(input: {
  sheetName: string;
  fileName: string;
  rows: string[][];
  today: string;
}) {
  let headerAt = -1;
  let best = 0;
  input.rows.slice(0, 15).forEach((row, index) => {
    const score = row.filter((cell) => roleForHeader(cell) !== "ignore").length;
    if (score > best) {
      best = score;
      headerAt = index;
    }
  });
  if (headerAt < 0 || best < 2) {
    return {
      signature: "",
      headers: [] as string[],
      mapping: {} as Record<number, ColumnRole>,
      rows: [] as SheetRow[],
      error: "No heading row was found.",
    };
  }
  const headers = input.rows[headerAt] ?? [];
  const mapping: Record<number, ColumnRole> = {};
  headers.forEach((header, index) => {
    mapping[index] = roleForHeader(header);
  });
  const signature = headers
    .map((header) => norm(header))
    .filter(Boolean)
    .sort()
    .join("|");
  const storeFallback = input.sheetName || input.fileName.replace(/\.[^.]+$/, "");
  const rows: SheetRow[] = [];
  input.rows.slice(headerAt + 1).forEach((cells, offset) => {
    const rowNumber = headerAt + offset + 2;
    if (cells.every((cell) => !cell.trim())) return;
    if (isTotal(cells)) {
      rows.push(
        blank(
          rowNumber,
          "skip",
          "Total row. Used only as a check.",
          storeFallback,
          input.today,
        ),
      );
      return;
    }
    const picked = pick(cells, mapping);
    const storeName = picked.store || storeFallback;
    const entryOn = picked.date || input.today;
    if (
      picked.bagsSold == null &&
      picked.kgSold == null &&
      picked.bagsBought == null &&
      picked.kgBought == null &&
      picked.amount == null
    ) {
      rows.push(
        blank(
          rowNumber,
          "problem",
          "This row has no bags, kilograms, or amount.",
          storeName,
          entryOn,
        ),
      );
      return;
    }
    if (
      [
        picked.bagsSold,
        picked.kgSold,
        picked.bagsBought,
        picked.kgBought,
        picked.amount,
      ].some((value) => value != null && value < 0)
    ) {
      rows.push(blank(rowNumber, "problem", "A number is negative.", storeName, entryOn));
      return;
    }
    rows.push({
      rowNumber,
      status: "ready",
      reason: "",
      storeName,
      entryOn,
      bagsSold: picked.bagsSold,
      kgSold: picked.kgSold,
      bagsBought: picked.bagsBought,
      kgBought: picked.kgBought,
      amount: picked.amount,
    });
  });
  return { signature, headers, mapping, rows, error: "" };
}

function blank(
  rowNumber: number,
  status: SheetRow["status"],
  reason: string,
  storeName: string,
  entryOn: string,
): SheetRow {
  return {
    rowNumber,
    status,
    reason,
    storeName,
    entryOn,
    bagsSold: null,
    kgSold: null,
    bagsBought: null,
    kgBought: null,
    amount: null,
  };
}

function pick(cells: string[], mapping: Record<number, ColumnRole>) {
  const out = {
    date: "",
    store: "",
    bagsSold: null as number | null,
    kgSold: null as number | null,
    bagsBought: null as number | null,
    kgBought: null as number | null,
    amount: null as number | null,
  };
  cells.forEach((cell, index) => {
    const role = mapping[index] ?? "ignore";
    if (role === "date" && !out.date) out.date = parseDate(cell) ?? "";
    if (role === "store" && !out.store) out.store = cell.trim();
    if (role === "bags_sold" && out.bagsSold == null) out.bagsSold = parseNumber(cell);
    if (role === "kg_sold" && out.kgSold == null) out.kgSold = parseNumber(cell);
    if (role === "bags_bought" && out.bagsBought == null)
      out.bagsBought = parseNumber(cell);
    if (role === "kg_bought" && out.kgBought == null) out.kgBought = parseNumber(cell);
    if (role === "amount" && out.amount == null) out.amount = parseNumber(cell);
  });
  return out;
}

export function applyMapping(
  rows: string[][],
  headerAt: number,
  mapping: Record<number, ColumnRole>,
  sheetName: string,
  today: string,
) {
  return parseGrid({
    sheetName,
    fileName: sheetName,
    rows: rows.map((row, index) =>
      index === headerAt
        ? row.map((_, cell) => labelFor(mapping[cell] ?? "ignore"))
        : row,
    ),
    today,
  });
}

function labelFor(role: ColumnRole) {
  if (role === "bags_sold") return "bags sold";
  if (role === "kg_sold") return "kg sold";
  if (role === "bags_bought") return "bags bought";
  if (role === "kg_bought") return "kg bought";
  if (role === "amount") return "amount";
  if (role === "date") return "date";
  if (role === "store") return "store";
  return "";
}
