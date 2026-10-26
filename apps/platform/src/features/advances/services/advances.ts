import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listAdvances(agentId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("agent_cash_advances")
    .select("*")
    .order("advanced_on", { ascending: false });
  if (agentId) query = query.eq("agent_id", agentId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function recordAdvance(input: {
  agentId: string;
  amountNaira: number;
  advancedOn: string;
  recordedBy: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("agent_cash_advances").insert({
    id: createId(),
    agent_id: input.agentId,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    advanced_on: input.advancedOn,
    notes: input.notes || null,
    recorded_by: input.recordedBy,
  });
  if (error) throw error;
}

export async function getAgentBalance(agentId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("agent_balances")
    .select("*")
    .eq("agent_id", agentId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listAgentBalances() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("agent_balances").select("*");
  if (error) throw error;
  return data;
}
