import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listTransactions() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("occurred_on", { ascending: false });
  if (error) throw error;
  return data;
}

export async function recordTransaction(input: {
  direction: "incoming" | "outgoing";
  amountNaira: number;
  occurredOn: string;
  category: string;
  description: string;
  recordedBy: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("transactions").insert({
    id: createId(),
    direction: input.direction,
    amount_kobo: Number(nairaToKobo(input.amountNaira)),
    occurred_on: input.occurredOn,
    category: input.category,
    description: input.description,
    recorded_by: input.recordedBy,
  });
  if (error) throw error;
}
