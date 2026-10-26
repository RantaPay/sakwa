import { createId, deliveryTotalKg } from "@sakwa/utils";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { enqueueWrite, isOfflineError } from "@/lib/offline/sync";
import { toDeliveryRow } from "../utils/map-delivery";

export async function listAgentDeliveries(agentId: string) {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("agent_deliveries")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listWarehouseDeliveries() {
  const supabase = createBrowserSupabase();
  const { data, error } = await supabase
    .from("agent_deliveries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function recordDelivery(input: {
  agentId: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  amountSpentNaira: number;
  deliveredOn: string;
  notes?: string;
}) {
  const row = toDeliveryRow({ ...input, id: createId() });
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("agent_deliveries").insert(row);
    if (error) throw error;
  } catch (error) {
    if (isOfflineError(error)) {
      await enqueueWrite({
        id: row.id,
        tableName: "agent_deliveries",
        payload: row,
      });
      return;
    }
    throw error;
  }
}

export async function decideDelivery(input: {
  id: string;
  warehouseId: string;
  bagCount: number;
  kgPerBag: number;
  status: "confirmed" | "rejected";
  userId: string;
  reason?: string;
}) {
  const supabase = createBrowserSupabase();
  const patch = {
    status: input.status,
    rejection_reason: input.reason || null,
    confirmed_by: input.userId,
    confirmed_at: new Date().toISOString(),
  };
  const stockRow =
    input.status === "confirmed"
      ? {
          id: createId(),
          warehouse_id: input.warehouseId,
          direction: "in" as const,
          bag_count: input.bagCount,
          total_kg: deliveryTotalKg(input.bagCount, input.kgPerBag).toString(),
          delivery_id: input.id,
          recorded_by: input.userId,
        }
      : null;

  try {
    const { error } = await supabase.from("agent_deliveries").update(patch).eq("id", input.id);
    if (error) throw error;
    if (stockRow) {
      const { error: stockError } = await supabase.from("stock_movements").insert(stockRow);
      if (stockError) throw stockError;
    }
  } catch (error) {
    if (isOfflineError(error)) {
      await enqueueWrite({
        id: input.id,
        tableName: "agent_deliveries",
        payload: { id: input.id, ...patch },
      });
      if (stockRow) {
        await enqueueWrite({
          id: stockRow.id,
          tableName: "stock_movements",
          payload: stockRow,
        });
      }
      return;
    }
    throw error;
  }
}
