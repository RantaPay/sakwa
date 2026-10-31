import { deliveryTotalKg } from "./stock";

export function pricePerKgKobo(row: {
  price_per_kg_kobo?: number | null;
  price_per_bag_kobo?: number | null;
  kg_per_bag?: number | string | null;
}): number {
  const recorded = Number(row.price_per_kg_kobo ?? 0);
  if (recorded > 0) return recorded;
  const perBag = Number(row.price_per_bag_kobo ?? 0);
  const kgEach = Number(row.kg_per_bag ?? 0);
  if (perBag > 0 && kgEach > 0) return Math.round(perBag / kgEach);
  return 0;
}

export function lineTotalKobo(
  pricePerKgKobo: number,
  bagCount: number,
  kgPerBag: number | string,
): number {
  if (!(pricePerKgKobo > 0)) return 0;
  const kg = deliveryTotalKg(bagCount, Number(kgPerBag));
  if (!(kg > 0)) return 0;
  return Math.round(pricePerKgKobo * kg);
}

export function orderLineKobo(row: {
  price_per_kg_kobo?: number | null;
  price_per_bag_kobo?: number | null;
  kg_per_bag?: number | string | null;
  bag_count?: number | null;
}): number {
  return lineTotalKobo(pricePerKgKobo(row), Number(row.bag_count ?? 0), row.kg_per_bag ?? 0);
}

export type DayPrice = {
  effective_on: string;
  created_at?: string;
  buying_price_per_kg_kobo: number;
  selling_price_per_kg_kobo: number;
};

/** Lagos calendar day for a date-only string or a timestamp. */
export function bookDay(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

/** Price in force on that day. If every price starts later, the earliest one is used. */
export function priceForDay(rates: readonly DayPrice[], day: string): DayPrice | null {
  if (rates.length === 0) return null;
  const on = bookDay(day);
  const sorted = [...rates].sort((a, b) => {
    const byDay = b.effective_on.localeCompare(a.effective_on);
    if (byDay !== 0) return byDay;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
  return sorted.find((row) => row.effective_on <= on) ?? sorted[sorted.length - 1] ?? null;
}
