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
    status: "paid",
    paid_by: input.recordedBy,
    paid_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function requestAgentPay(input: {
  agentId: string;
  warehouseId: string;
  amountNaira: number;
  purpose: string;
  expectedBagCount: number;
  expectedKg: number;
  advancedOn: string;
  requestedBy: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("agent_cash_advances").insert({
    id: createId(),
    agent_id: input.agentId,
    warehouse_id: input.warehouseId,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    advanced_on: input.advancedOn,
    purpose: input.purpose,
    expected_bag_count: input.expectedBagCount,
    expected_kg: input.expectedKg.toString(),
    notes: input.purpose,
    recorded_by: input.requestedBy,
    requested_by: input.requestedBy,
    status: "requested",
  });
  if (error) throw error;
}

export async function payAgentRequest(id: string, paidBy: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("agent_cash_advances")
    .update({
      status: "paid",
      paid_by: paidBy,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
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
