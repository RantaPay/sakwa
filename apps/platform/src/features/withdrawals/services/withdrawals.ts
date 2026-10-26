import { assertWithdrawalAllowed, createId, nairaToKobo, startOfIsoWeekUtc, isoDate } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { getPosition } from "@/features/investments";

export async function listWithdrawals(investorId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("withdrawal_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (investorId) query = query.eq("investor_id", investorId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function requestWithdrawal(input: {
  investorId: string;
  amountNaira: number;
}) {
  const cycleStart = isoDate(startOfIsoWeekUtc());
  const existing = await listWithdrawals(input.investorId);
  const already = existing.some(
    (row) =>
      row.cycle_start === cycleStart &&
      ["requested", "approved", "paid"].includes(row.status),
  );
  const position = await getPosition(input.investorId);
  const amountKobo = nairaToKobo(input.amountNaira);
  assertWithdrawalAllowed({
    amountKobo,
    withdrawableKobo: BigInt(position?.withdrawable_kobo ?? 0),
    alreadyRequestedThisCycle: already,
  });

  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("withdrawal_requests").insert({
    id: createId(),
    investor_id: input.investorId,
    amount_kobo: Number(amountKobo),
    cycle_start: cycleStart,
    status: "requested",
  });
  if (error) throw error;
}

export async function decideWithdrawal(
  id: string,
  status: "approved" | "rejected",
  userId: string,
  reason?: string,
) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status,
      rejection_reason: reason || null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function markWithdrawalPaid(id: string, userId: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "paid",
      paid_by: userId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}
