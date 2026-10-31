import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listMarketPrices() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("market_prices").select("*");
  if (error) throw error;
  return [...(data ?? [])].sort((a, b) => {
    const day = b.effective_on.localeCompare(a.effective_on);
    if (day !== 0) return day;
    return b.created_at.localeCompare(a.created_at);
  });
}

export async function recordMarketPrice(input: {
  buyingNaira: number;
  sellingNaira: number;
  effectiveOn: string;
  recordedBy: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("market_prices").insert({
    id: createId(),
    buying_price_per_kg_kobo: Number(nairaToKobo(input.buyingNaira)),
    selling_price_per_kg_kobo: Number(nairaToKobo(input.sellingNaira)),
    effective_on: input.effectiveOn,
    notes: input.notes || null,
    recorded_by: input.recordedBy,
  });
  if (error) throw error;
}
