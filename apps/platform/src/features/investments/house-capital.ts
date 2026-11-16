import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listHouseCapital() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("house_capital")
    .select("*")
    .order("invested_on", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function recordHouseCapital(input: {
  kind: "initial" | "other";
  amountNaira: number;
  investedOn: string;
  recordedBy: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("house_capital").insert({
    id: createId(),
    kind: input.kind,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    invested_on: input.investedOn,
    notes: input.notes || null,
    recorded_by: input.recordedBy,
  });
  if (error) throw error;
}
