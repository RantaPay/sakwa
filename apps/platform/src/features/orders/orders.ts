import { createId, nairaToKobo } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export async function listCustomerOrders(customerId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listAllOrders() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function placeOrder(input: {
  customerId: string;
  bagCount: number;
  kgPerBag: number;
  deliveryDetails: string;
  notes?: string;
}) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase.from("orders").insert({
    id: createId(),
    customer_id: input.customerId,
    bag_count: input.bagCount,
    kg_per_bag: input.kgPerBag.toString(),
    price_per_bag_kobo: 0,
    price_per_kg_kobo: 0,
    delivery_details: input.deliveryDetails,
    notes: input.notes || null,
    status: "placed",
  });
  if (error) throw error;
}

export async function setOrderPrice(orderId: string, pricePerKgNaira: number, warehouseId?: string) {
  const supabase = createBrowserSupabase();
  const { error } = await supabase
    .from("orders")
    .update({
      price_per_kg_kobo: Number(nairaToKobo(pricePerKgNaira)),
      warehouse_id: warehouseId ?? null,
    })
    .eq("id", orderId);
  if (error) throw error;
}

export async function setOrderStatus(
  orderId: string,
  status: "payment_recorded" | "payment_confirmed" | "dispatched" | "delivered",
) {
  const supabase = createBrowserSupabase();
  const patch: {
    status: typeof status;
    dispatched_at?: string;
    delivered_at?: string;
  } = { status };
  if (status === "dispatched") patch.dispatched_at = new Date().toISOString();
  if (status === "delivered") patch.delivered_at = new Date().toISOString();
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) throw error;
}
