import { createId, priceForDay, type DayPrice } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function loadCalculatorBase() {
  const supabase = createBrowserSupabase();
  const [settings, prices, stores, entries, layouts] = await Promise.all([
    supabase
      .from("house_settings")
      .select("default_kg_per_bag, weekly_interest_bps")
      .eq("id", "house")
      .maybeSingle(),
    supabase.from("market_prices").select("*"),
    supabase.from("warehouses").select("id, name, is_active").eq("is_active", true),
    supabase
      .from("store_entries")
      .select("*")
      .order("entry_on", { ascending: false })
      .limit(200),
    supabase.from("import_layouts").select("signature, mapping"),
  ]);
  if (settings.error) throw settings.error;
  if (prices.error) throw prices.error;
  if (stores.error) throw stores.error;
  if (entries.error) throw entries.error;
  if (layouts.error) throw layouts.error;
  const rates = await supabase.from("warehouse_prices").select("*");
  if (rates.error) throw rates.error;
  return {
    kgPerBag: Number(settings.data?.default_kg_per_bag ?? 50),
    weeklyInterestBps: Number(settings.data?.weekly_interest_bps ?? 0),
    housePrices: prices.data ?? [],
    storePrices: rates.data ?? [],
    stores: stores.data ?? [],
    entries: entries.data ?? [],
    layouts: layouts.data ?? [],
  };
}

export function rateForStore(
  warehouseId: string,
  day: string,
  house: DayPrice[],
  storePrices: {
    warehouse_id: string;
    effective_on: string;
    buying_price_per_kg_kobo: number;
    selling_price_per_kg_kobo: number;
    created_at?: string;
  }[],
) {
  const mine: DayPrice[] = storePrices.filter((row) => row.warehouse_id === warehouseId);
  return priceForDay(mine, day) ?? priceForDay(house, day);
}

export async function saveKgPerBag(kg: number, userId: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("house_settings")
    .update({
      default_kg_per_bag: kg,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "house");
  if (error) throw error;
}

export async function saveStoreRate(input: {
  warehouseId: string;
  buyingKobo: number;
  sellingKobo: number;
  effectiveOn: string;
  userId: string;
}) {
  const supabase = createBrowserSupabase();
  const existing = await supabase
    .from("warehouse_prices")
    .select("id")
    .eq("warehouse_id", input.warehouseId)
    .eq("effective_on", input.effectiveOn)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const { error } = await supabase
      .from("warehouse_prices")
      .update({
        buying_price_per_kg_kobo: input.buyingKobo,
        selling_price_per_kg_kobo: input.sellingKobo,
        recorded_by: input.userId,
      })
      .eq("id", existing.data.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("warehouse_prices").insert({
    id: createId(),
    warehouse_id: input.warehouseId,
    buying_price_per_kg_kobo: input.buyingKobo,
    selling_price_per_kg_kobo: input.sellingKobo,
    effective_on: input.effectiveOn,
    recorded_by: input.userId,
  });
  if (error) throw error;
}

export async function saveEntries(
  rows: {
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
  }[],
  userId: string,
) {
  const supabase = createBrowserSupabase();
  let added = 0;
  let skipped = 0;
  for (const row of rows) {
    const { error } = await supabase.from("store_entries").insert({
      id: createId(),
      warehouse_id: row.warehouseId,
      entry_on: row.entryOn,
      bags_sold: row.bagsSold,
      kg_sold: row.kgSold,
      bags_bought: row.bagsBought,
      kg_bought: row.kgBought,
      source: row.source,
      fingerprint: row.fingerprint,
      buying_price_per_kg_kobo: row.buyingKobo,
      selling_price_per_kg_kobo: row.sellingKobo,
      sales_kobo: row.salesKobo,
      expense_kobo: row.expenseKobo,
      profit_kobo: row.profitKobo,
      notes: row.notes || null,
      recorded_by: userId,
    });
    if (error?.code === "23505") {
      skipped += 1;
      continue;
    }
    if (error) throw error;
    added += 1;
  }
  return { added, skipped };
}

export async function saveLayout(signature: string, mapping: Record<string, string>) {
  const supabase = createBrowserSupabase();
  const existing = await supabase
    .from("import_layouts")
    .select("id")
    .eq("signature", signature)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const { error } = await supabase
      .from("import_layouts")
      .update({ mapping })
      .eq("id", existing.data.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from("import_layouts")
    .insert({ id: createId(), signature, mapping });
  if (error) throw error;
}
