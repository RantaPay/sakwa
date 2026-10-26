import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { setOrderStatus } from "@/features/orders";

export async function recordPayment(input: {
  orderId: string;
  amountNaira: number;
  recordedBy: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("customer_payments").insert({
    id: createId(),
    order_id: input.orderId,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    recorded_by: input.recordedBy,
    notes: input.notes || null,
  });
  if (error) throw error;
  await setOrderStatus(input.orderId, "payment_recorded");
}

export async function confirmPayment(id: string, orderId: string, userId: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("customer_payments")
    .update({
      confirmed_by: userId,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  await setOrderStatus(orderId, "payment_confirmed");
}

export async function listPayments() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("customer_payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
