import { createId, deliveryTotalKg } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { enqueueWrite, isOfflineError } from "@/lib/offline/sync";
import { setOrderStatus } from "@/features/orders";

export async function listStock() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase.from("warehouse_stock").select("*");
  if (error) throw error;
  return data;
}

export async function listMovements(warehouseId?: string) {
  const supabase = createBrowserSupabase();
  let query = supabase
    .from("stock_movements")
    .select("*")
    .order("created_at", { ascending: false });
  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function releaseStock(input: {
  orderId: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  recordedBy: string;
}) {
  const row = {
    id: createId(),
    warehouse_id: input.warehouseId,
    direction: "out" as const,
    bag_count: input.bagCount,
    total_kg: deliveryTotalKg(input.bagCount, input.kgPerBag).toString(),
    order_id: input.orderId,
    recorded_by: input.recordedBy,
  };
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("stock_movements").insert(row);
    if (error) throw error;
    await setOrderStatus(input.orderId, "delivered");
  } catch (error) {
    if (isOfflineError(error)) {
      await enqueueWrite({ id: row.id, tableName: "stock_movements", payload: row });
      return;
    }
    throw error;
  }
}
