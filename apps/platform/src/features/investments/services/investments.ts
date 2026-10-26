import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listInvestments(investorId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase.from("investments").select("*").order("invested_on", { ascending: false });
  if (investorId) query = query.eq("investor_id", investorId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function recordInvestment(input: {
  investorId: string;
  amountNaira: number;
  investedOn: string;
  recordedBy: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("investments").insert({
    id: createId(),
    investor_id: input.investorId,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    invested_on: input.investedOn,
    recorded_by: input.recordedBy,
    notes: input.notes || null,
  });
  if (error) throw error;
}

export async function getPosition(investorId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("investor_positions")
    .select("*")
    .eq("investor_id", investorId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listPositions() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("investor_positions").select("*");
  if (error) throw error;
  return data;
}
