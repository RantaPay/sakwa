import { assertWithdrawalAllowed, createId, formatNaira, nairaToKobo, startOfIsoWeekUtc, isoDate } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { getPosition } from "@/features/investments";
import { notifyRole, notifyUser } from "@/features/notifications";

const PENDING = ["requested", "accepted", "receipt_sent", "paid"];

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
  payoutBankName: string;
  payoutAccountName: string;
  payoutAccountNumber: string;
}) {
  const cycleStart = isoDate(startOfIsoWeekUtc());
  const existing = await listWithdrawals(input.investorId);
  const already = existing.some(
    (row) => row.cycle_start === cycleStart && PENDING.includes(row.status),
  );
  const position = await getPosition(input.investorId);
  const amountKobo = nairaToKobo(input.amountNaira);
  assertWithdrawalAllowed({
    amountKobo,
    withdrawableKobo: BigInt(position?.withdrawable_kobo ?? 0),
    alreadyRequestedThisCycle: already,
  });

  const id = createId();
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("withdrawal_requests").insert({
    id,
    investor_id: input.investorId,
    amount_kobo: Number(amountKobo),
    cycle_start: cycleStart,
    status: "requested",
    payout_bank_name: input.payoutBankName,
    payout_account_name: input.payoutAccountName,
    payout_account_number: input.payoutAccountNumber,
  });
  if (error) throw error;
  await notifyRole("director", {
    title: "Profit request",
    body: `An investor asked to take out ${formatNaira(amountKobo)}.`,
    kind: "withdrawal_requested",
    entityTable: "withdrawal_requests",
    entityId: id,
  });
}

export async function decideWithdrawal(
  id: string,
  status: "accepted" | "rejected",
  userId: string,
  reason?: string,
) {
  const supabase = createBrowserSupabase();
  const current = await supabase.from("withdrawal_requests").select("*").eq("id", id).single();
  if (current.error) throw current.error;
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
  const row = current.data;
  if (status === "accepted") {
    await notifyUser({
      userId: row.investor_id,
      title: "Profit request accepted",
      body: `We will send ${formatNaira(row.amount_kobo)} to ${row.payout_account_name ?? "your account"}, ${row.payout_bank_name ?? ""}, ${row.payout_account_number ?? ""}. Confirm on the platform when it lands.`,
      kind: "withdrawal_accepted",
      entityTable: "withdrawal_requests",
      entityId: id,
    });
    return;
  }
  await notifyUser({
    userId: row.investor_id,
    title: "Profit request turned down",
    body: reason || "The director turned this request down.",
    kind: "withdrawal_rejected",
    entityTable: "withdrawal_requests",
    entityId: id,
  });
}

export async function uploadWithdrawalReceipt(input: {
  id: string;
  filename: string;
  url: string;
  userId: string;
}) {
  const supabase = createBrowserSupabase();
  const current = await supabase.from("withdrawal_requests").select("*").eq("id", input.id).single();
  if (current.error) throw current.error;
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "receipt_sent",
      receipt_filename: input.filename,
      receipt_url: input.url,
      receipt_uploaded_at: new Date().toISOString(),
      paid_by: input.userId,
    })
    .eq("id", input.id);
  if (error) throw error;
  await notifyUser({
    userId: current.data.investor_id,
    title: "Profit sent",
    body: "A transfer receipt is waiting. Confirm it if the money has reached your account.",
    kind: "withdrawal_receipt",
    entityTable: "withdrawal_requests",
    entityId: input.id,
  });
}

export async function confirmWithdrawalReceived(id: string, userId: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "paid",
      received_by: userId,
      received_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  await notifyRole("director", {
    title: "Profit confirmed",
    body: "An investor confirmed they received their profit.",
    kind: "withdrawal_paid",
    entityTable: "withdrawal_requests",
    entityId: id,
  });
}
