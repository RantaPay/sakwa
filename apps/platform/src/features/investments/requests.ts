import { createId, formatNaira, isoDate, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { notifyRole, notifyUser } from "@/features/notifications";
import { houseAccountMessage } from "@/lib/house-account";
import { recordInvestment } from "./investments";

export async function listInvestmentRequests(investorId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("investment_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (investorId) query = query.eq("investor_id", investorId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function requestInvestment(input: {
  investorId: string;
  amountNaira: number;
  notes?: string;
}) {
  const id = createId();
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("investment_requests").insert({
    id,
    investor_id: input.investorId,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    notes: input.notes || null,
    status: "requested",
  });
  if (error) throw error;
  await notifyRole("director", {
    title: "Investment request",
    body: `An investor asked to put in ${formatNaira(nairaToKobo(input.amountNaira))}.`,
    kind: "investment_requested",
    entityTable: "investment_requests",
    entityId: id,
  });
}

export async function decideInvestmentRequest(input: {
  id: string;
  investorId: string;
  amountKobo: number;
  status: "accepted" | "rejected";
  userId: string;
  reason?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("investment_requests")
    .update({
      status: input.status,
      rejection_reason: input.reason || null,
      reviewed_by: input.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw error;

  if (input.status === "accepted") {
    await notifyUser({
      userId: input.investorId,
      title: "Pay in your investment",
      body: houseAccountMessage(formatNaira(input.amountKobo)),
      kind: "investment_accepted",
      entityTable: "investment_requests",
      entityId: input.id,
    });
    return;
  }

  await notifyUser({
    userId: input.investorId,
    title: "Investment request turned down",
    body: input.reason || "The director turned this request down.",
    kind: "investment_rejected",
    entityTable: "investment_requests",
    entityId: input.id,
  });
}

export async function uploadInvestmentReceipt(input: {
  id: string;
  filename: string;
  url: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("investment_requests")
    .update({
      status: "receipt_sent",
      receipt_filename: input.filename,
      receipt_url: input.url,
      receipt_uploaded_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw error;
  await notifyRole("director", {
    title: "Investment receipt in",
    body: "An investor uploaded a payment receipt. Confirm it to put the investment on the books.",
    kind: "investment_receipt",
    entityTable: "investment_requests",
    entityId: input.id,
  });
}

export async function confirmInvestmentPayment(input: {
  id: string;
  investorId: string;
  amountKobo: number;
  userId: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("investment_requests")
    .update({
      status: "confirmed",
      confirmed_by: input.userId,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw error;
  await recordInvestment({
    investorId: input.investorId,
    amountNaira: Number(input.amountKobo) / 100,
    investedOn: isoDate(new Date()),
    recordedBy: input.userId,
    notes: "Confirmed investment receipt",
  });
  await notifyUser({
    userId: input.investorId,
    title: "Investment is on the books",
    body: "Your payment was confirmed. Interest now reads from this investment.",
    kind: "investment_confirmed",
    entityTable: "investment_requests",
    entityId: input.id,
  });
}
