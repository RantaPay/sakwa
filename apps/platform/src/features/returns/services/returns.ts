import {
  calculateInvestorReturn,
  createId,
  type ReturnFormulaKind,
} from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { listPositions } from "@/features/investments";

export async function listReturns(investorId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("investor_returns")
    .select("*")
    .order("cycle_start", { ascending: false });
  if (investorId) query = query.eq("investor_id", investorId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Isolated applicator. The business has not confirmed the formula.
 * This writes rows using the env-selected kind and does not treat the
 * result as a product decision.
 */
export async function applyReturnCycle(input: {
  cycleStart: string;
  cycleEnd: string;
  kind: ReturnFormulaKind;
  weeklyPercentBps: number;
  periodProfitKobo?: bigint;
}) {
  const positions = await listPositions();
  const totalCapital = positions.reduce(
    (sum, row) => sum + BigInt(row.capital_kobo ?? 0),
    0n,
  );
  const supabase = createBrowserSupabase();

  for (const position of positions) {
    const capital = BigInt(position.capital_kobo ?? 0);
    if (capital <= 0n) continue;
    const amount = calculateInvestorReturn({
      kind: input.kind,
      capitalKobo: capital,
      weeklyPercentBps: input.weeklyPercentBps,
      periodProfitKobo: input.periodProfitKobo,
      totalCapitalKobo: totalCapital,
    });
    const { error } = await supabase.from("investor_returns").insert({
      id: createId(),
      investor_id: position.investor_id,
      cycle_start: input.cycleStart,
      cycle_end: input.cycleEnd,
      amount_kobo: Number(amount),
      formula_kind: input.kind,
    });
    if (error) throw error;
  }
}
